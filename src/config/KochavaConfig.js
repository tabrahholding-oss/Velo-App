/**
 * Kochava configuration.
 *
 * App GUIDs come from the Kochava dashboard:
 *   Apps & Assets > (your app) > App GUID  (one per platform)
 */

// TODO: Android GUID still needs to be filled in from the dashboard.
export const KOCHAVA_ANDROID_APP_GUID = 'REPLACE_WITH_ANDROID_APP_GUID';
export const KOCHAVA_IOS_APP_GUID = 'kovelo-854';

// Verbose SDK logging in debug builds only. Kochava's own docs recommend
// keeping this off in release since it logs payload contents.
export const KOCHAVA_LOG_LEVEL = __DEV__ ? 'debug' : 'info';
