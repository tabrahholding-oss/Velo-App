/**
 * @format
 */
import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import {
  KochavaTracker,
  KochavaTrackerLogLevel,
} from 'react-native-kochava-tracker';


// Verbose SDK logs (KVA/Tracker ...) in Metro / logcat / Xcode console.
KochavaTracker.instance.setLogLevel(KochavaTrackerLogLevel.Debug);

// NOTE: setInitCompletedListener is broken on iOS in v2.8.2 (native method is
// declared `BOOL *` instead of `BOOL`), so it crashes at startup — do not use it.
// getStarted() + getDeviceId() below are enough to verify startup.

KochavaTracker.instance.registerAndroidAppGuid('kovelo-8u8t0n');
KochavaTracker.instance.registerIosAppGuid('kovelo-854');
KochavaTracker.instance.start();

// Confirm running state + the Kochava device id (KDID).
KochavaTracker.instance
  .getStarted()
  .then(started => console.log('KOCHAVA started?', started))
  .catch(e => console.log('KOCHAVA getStarted error:', e));

KochavaTracker.instance
  .getDeviceId()
  .then(deviceId => console.log('KOCHAVA deviceId:', deviceId))
  .catch(e => console.log('KOCHAVA getDeviceId error:', e));

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  // Render the app component on foreground launch
  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
