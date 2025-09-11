import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
import { AdConfig, isNativeAndroid } from './adConfig';

class AdServiceImpl {
	constructor() {
		this.initialized = false;
		this.initPromise = null;
	}

	async init() {
		if (!isNativeAndroid()) return false; // Only init on Android device
		if (this.initialized) return true;
		if (this.initPromise) return this.initPromise;
		this.initPromise = (async () => {
			try {
				// Configure with test app ID by default
						await AdMob.initialize();
				this.initialized = true;
				return true;
			} catch (e) {
				console.warn('[AdService] init failed', e);
				return false;
			}
		})();
		return this.initPromise;
	}

	async showRewarded() {
		const ok = await this.init();
		if (!ok) {
			// Fallback: resolve immediately to not block gameplay in web/dev
			return { rewarded: true, fallback: true };
		}

		try {
					// Prepare and show a Rewarded Video Ad
							const adUnitId = AdConfig.rewardedId; // test id by default
							const options = { adId: adUnitId, isTesting: true, npa: true };

							return new Promise(async (resolve) => {
								const hRewarded = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
									cleanup();
									resolve({ rewarded: true });
								});
								const hDismissed = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
									cleanup();
									resolve({ rewarded: false });
								});
								const hFailed = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, (err) => {
									console.warn('[AdService] Reward failed to show', err);
									cleanup();
									resolve({ rewarded: false, error: err });
								});

								const cleanup = async () => {
									try { await hRewarded.remove(); } catch {}
									try { await hDismissed.remove(); } catch {}
									try { await hFailed.remove(); } catch {}
								};

								try {
									await AdMob.prepareRewardVideoAd(options);
									await AdMob.showRewardVideoAd();
								} catch (e) {
									console.warn('[AdService] showRewarded exception', e);
									await cleanup();
									resolve({ rewarded: false, error: e });
								}
							});
		} catch (e) {
			console.warn('[AdService] showRewarded error', e);
			return { rewarded: false, error: e };
		}
	}
}

export const AdService = new AdServiceImpl();
