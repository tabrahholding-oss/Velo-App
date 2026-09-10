import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE} from '../config/ApiConfig';
import {registerKochavaPushToken, trackPushOpened} from './kochava';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  console.log(enabled, 'enabled');
  if (enabled) {
    console.log('Authorization status:', authStatus);
    // Fetching the token also registers it with Kochava for uninstall
    // measurement. Runs on every launch; registering the same token is a no-op.
    await getFCMToken();
  }
}

export async function notificationListener() {
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage.notification,
    );
    console.log('background state', remoteMessage.notification);
    trackPushOpened(remoteMessage);
  });

  // Check whether an initial notification is available
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
        console.log('initial notification', remoteMessage.notification);
        trackPushOpened(remoteMessage);
      }
    });
}

export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('📱 FCM Token:', token);
    // Kochava needs the token to measure uninstalls.
    registerKochavaPushToken(token);
    return token;
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
}
