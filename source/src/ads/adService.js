import { AdMob, RewardAdPluginEvents, RewardInterstitialAdPluginEvents, AdmobConsentStatus } from '@capacitor-community/admob';
import { AdConfig, isNativeAndroid } from './adConfig';

class AdServiceImpl {
	constructor() {
		this.initialized = false;
		this.initPromise = null;
		this.rewardInFlight = null; // prevent concurrent rewarded flows
		this.preloaded = false;
		this.preloadInFlight = null;
	}

	async init() {
		if (!isNativeAndroid()) return false; // Only init on Android device
		if (this.initialized) return true;
		if (this.initPromise) return this.initPromise;
		this.initPromise = (async () => {
			try {
				// Configure with test app ID by default
						await AdMob.initialize();
				// UMP consent flow (Android). Important for EEA/UK; otherwise ads may not load/show
				try {
					const consentInfo = await AdMob.requestConsentInfo();
					if (consentInfo && consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
						await AdMob.showConsentForm();
					}
				} catch (e) {
					console.warn('[AdService] consent flow skipped/failed', e);
				}
				this.initialized = true;
				return true;
			} catch (e) {
				console.warn('[AdService] init failed', e);
				return false;
			}
		})();
		return this.initPromise;
	}

	async preloadRewarded(maxAttempts = 2) {
		if (!isNativeAndroid()) return false;
		const ok = await this.init();
		if (!ok) return false;
		if (this.preloaded) return true;
		if (this.preloadInFlight) return this.preloadInFlight;
		const adUnitId = AdConfig.rewardedId;
		const options = { adId: adUnitId, isTesting: false };
		const usingInterstitial = (AdConfig && AdConfig.adType) ? AdConfig.adType === 'rewarded_interstitial' : false;
		let attempt = 0;
		this.preloadInFlight = new Promise(async (resolve) => {
			const tryOnce = async () => {
				attempt++;
				try {
					if (usingInterstitial) {
						await AdMob.prepareRewardInterstitialAd(options);
					} else {
						await AdMob.prepareRewardVideoAd(options);
					}
					this.preloaded = true;
					resolve(true);
				} catch (e) {
					// If code 3 (no fill), backoff and retry a limited number of times
					const code = e && (e.code || (e.error && e.error.code));
					if (code === 3 && attempt < maxAttempts) {
						const delay = 1000 * attempt; // 1s, then 2s
						setTimeout(tryOnce, delay);
					} else {
						resolve(false);
					}
				}
			};
			tryOnce();
		}).finally(() => { this.preloadInFlight = null; });
		return this.preloadInFlight;
	}

	async showRewarded() {
		// If a rewarded ad is already being shown/prepared, return the same promise
		if (this.rewardInFlight) return this.rewardInFlight;
		const ok = await this.init();
		if (!ok) {
			// Fallback: resolve immediately to not block gameplay in web/dev
			return { rewarded: true, fallback: true };
		}

		try {
			// Prepare and show based on configured ad type
			const adUnitId = AdConfig.rewardedId;
			// Do NOT force non-personalized ads here; rely on UMP consent flow above.
			// Forcing npa:true can reduce inventory and cause frequent "no fill" (code 3).
			const options = { adId: adUnitId, isTesting: false };

			this.rewardInFlight = new Promise(async (resolve) => {
				let earned = false;
				let done = false;
				let hRewarded, hDismissed, hFailed;

				const cleanup = async () => {
					try { if (hRewarded) await hRewarded.remove(); } catch {}
					try { if (hDismissed) await hDismissed.remove(); } catch {}
					try { if (hFailed) await hFailed.remove(); } catch {}
				};

				const type = (AdConfig && AdConfig.adType) ? AdConfig.adType : 'rewarded';
				const usingInterstitial = type === 'rewarded_interstitial';

				if (usingInterstitial) {
					// Rewarded Interstitial events
					hRewarded = await AdMob.addListener(RewardInterstitialAdPluginEvents.Rewarded, () => {
						earned = true;
						if (!done) { done = true; cleanup(); resolve({ rewarded: true, source: 'RI.Rewarded' }); }
					});
					await AdMob.addListener(RewardInterstitialAdPluginEvents.FailedToLoad, (err) => {
						console.warn('[AdService] Reward Interstitial failed to load', err);
						if (!done) { done = true; cleanup(); resolve({ rewarded: false, source: 'RI.FailedToLoad', error: err && (err.message || err), code: err && err.code }); }
					});
					hDismissed = await AdMob.addListener(RewardInterstitialAdPluginEvents.Dismissed, () => {
						if (done) return;
						setTimeout(() => { if (!done) { done = true; cleanup(); resolve({ rewarded: !!earned, source: 'RI.Dismissed', earned: earned, graceMs: 1500 }); } }, 1500);
					});
					hFailed = await AdMob.addListener(RewardInterstitialAdPluginEvents.FailedToShow, (err) => {
						console.warn('[AdService] Reward Interstitial failed to show', err);
						if (!done) { done = true; cleanup(); resolve({ rewarded: false, source: 'RI.FailedToShow', error: err && (err.message || err), code: err && err.code }); }
					});

					try {
						await AdMob.prepareRewardInterstitialAd(options);
						await AdMob.showRewardInterstitialAd();
					} catch (e) {
						console.warn('[AdService] showRewarded (RI) exception', e);
						await cleanup();
						if (!done) resolve({ rewarded: false, source: 'RI.Exception', error: e });
					}
				} else {
					// Classic Rewarded Video events
					hRewarded = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
						earned = true;
						if (!done) { done = true; cleanup(); resolve({ rewarded: true, source: 'Rewarded' }); }
					});
					await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (err) => {
						console.warn('[AdService] Reward failed to load', err);
						if (!done) { done = true; cleanup(); resolve({ rewarded: false, source: 'FailedToLoad', error: err && (err.message || err), code: err && err.code }); }
					});
					hDismissed = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
						if (done) return;
						setTimeout(() => { if (!done) { done = true; cleanup(); resolve({ rewarded: !!earned, source: 'Dismissed', earned: earned, graceMs: 1500 }); } }, 1500);
					});
					hFailed = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, (err) => {
						console.warn('[AdService] Reward failed to show', err);
						if (!done) { done = true; cleanup(); resolve({ rewarded: false, source: 'FailedToShow', error: err && (err.message || err), code: err && err.code }); }
					});

					try {
						await AdMob.prepareRewardVideoAd(options);
						await AdMob.showRewardVideoAd();
					} catch (e) {
						console.warn('[AdService] showRewarded exception', e);
						await cleanup();
						if (!done) resolve({ rewarded: false, source: 'Exception', error: e });
					}
				}
			}).then((r) => { return r; }).finally(() => { this.rewardInFlight = null; });

			return this.rewardInFlight;
		} catch (e) {
			console.warn('[AdService] showRewarded error', e);
			return { rewarded: false, error: e };
		}
	}
}

export const AdService = new AdServiceImpl();
