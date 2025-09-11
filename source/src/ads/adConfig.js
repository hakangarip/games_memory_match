// Centralized Ad configuration
// Use Google test IDs by default. Replace production IDs when you publish.
// Docs: https://developers.google.com/admob/android/test-ads

export const AdConfig = {
  // Google provided TEST App ID for Android
  androidAppId: 'ca-app-pub-3940256099942544~3347511713',
  // Your production App ID (keep commented or unused until release)
  // prodAndroidAppId: 'ca-app-pub-0701930116218917~6163254830',

  // Rewarded Ad Unit IDs
  // Test rewarded ID
  rewardedId: 'ca-app-pub-3940256099942544/5224354917',
  // Production rewarded ID (uncomment when going live)
  // prodRewardedId: 'ca-app-pub-0701930116218917/1128574096',
};

export const isNativeAndroid = () => {
  try {
    if (typeof window === 'undefined') return false;
    const C = window.Capacitor;
    if (!C || typeof C.getPlatform !== 'function') return false;
    return C.getPlatform() === 'android';
  } catch (e) {
    return false;
  }
};
