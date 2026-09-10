import {Platform} from 'react-native';
import {
  KochavaTracker,
  KochavaTrackerEventType,
  KochavaTrackerLogLevel,
} from 'react-native-kochava-tracker';
import {
  KOCHAVA_ANDROID_APP_GUID,
  KOCHAVA_IOS_APP_GUID,
  KOCHAVA_LOG_LEVEL,
} from '../config/KochavaConfig';

let started = false;

/**
 * Start the Kochava SDK. Call this once, as early in app startup as possible --
 * the install/session attribution is measured from here.
 */
export const startKochava = () => {
  if (started) {
    return;
  }
  try {
    KochavaTracker.instance.setLogLevel(
      KOCHAVA_LOG_LEVEL === 'debug'
        ? KochavaTrackerLogLevel.Debug
        : KochavaTrackerLogLevel.Info,
    );

    // Only register a platform GUID once it has been filled in -- starting the
    // SDK with a placeholder would send payloads to a non-existent app.
    if (!KOCHAVA_ANDROID_APP_GUID.startsWith('REPLACE_WITH')) {
      KochavaTracker.instance.registerAndroidAppGuid(KOCHAVA_ANDROID_APP_GUID);
    }
    if (!KOCHAVA_IOS_APP_GUID.startsWith('REPLACE_WITH')) {
      KochavaTracker.instance.registerIosAppGuid(KOCHAVA_IOS_APP_GUID);
    }

    if (Platform.OS === 'ios') {
      // Collect the IDFA once the user grants App Tracking Transparency.
      // The SDK auto-requests ATT on start and holds the install until the
      // prompt is answered, so NSUserTrackingUsageDescription must be present.
      KochavaTracker.instance.enableIosAtt();
      KochavaTracker.instance.setIosAttAuthorizationWaitTime(30);
    }

    KochavaTracker.instance.start();
    started = true;
    console.log('Kochava: started');

    if (__DEV__) {
      // The KDID identifies this install in the Kochava dashboard -- paste it
      // into the device lookup tool to see this device's traffic.
      KochavaTracker.instance
        .getDeviceId()
        .then(deviceId => console.log('Kochava: KDID =', deviceId))
        .catch(e => console.log('Kochava: could not read KDID', e));

      // Confirms the SDK is running.
      KochavaTracker.instance
        .getStarted()
        .then(v => console.log('Kochava: started flag =', v))
        .catch(e => console.log('Kochava: getStarted failed', e));
    }
  } catch (e) {
    console.log('Kochava: failed to start', e);
  }
};

/**
 * Tie the Kochava device to our own user id so installs and events can be
 * reconciled with backend data. Safe to call on every login.
 */
export const setKochavaUser = user => {
  try {
    if (user?.id != null) {
      KochavaTracker.instance.registerIdentityLink('user_id', String(user.id));
    }
    if (user?.email) {
      KochavaTracker.instance.registerIdentityLink('email', String(user.email));
    }
  } catch (e) {
    console.log('Kochava: failed to register identity link', e);
  }
};

/**
 * Send a standard Kochava event with a flat map of custom values.
 * Values are typed by Kochava, so route each one to the matching setter.
 */
const sendStandardEvent = (eventType, values = {}) => {
  try {
    const event = KochavaTracker.instance.buildEventWithEventType(eventType);
    Object.entries(values).forEach(([key, value]) => {
      if (value == null || value === '') {
        return;
      }
      if (typeof value === 'boolean') {
        event.setCustomBoolValue(key, value);
      } else if (typeof value === 'number') {
        event.setCustomNumberValue(key, value);
      } else {
        event.setCustomStringValue(key, String(value));
      }
    });
    event.send();
    console.log('Kochava: sent event', eventType, values);
  } catch (e) {
    console.log('Kochava: failed to send event', eventType, e);
  }
};

/** Send a custom (non-standard) event by name. */
const sendCustomEvent = (name, values = {}) => {
  try {
    KochavaTracker.instance.sendEventWithDictionary(name, values);
    console.log('Kochava: sent custom event', name, values);
  } catch (e) {
    console.log('Kochava: failed to send custom event', name, e);
  }
};

//
// App events
//

/** Fired when a new account is created. */
export const trackRegistrationComplete = ({userId, email, gender} = {}) => {
  sendStandardEvent(KochavaTrackerEventType.RegistrationComplete, {
    registration_method: 'email',
    user_id: userId,
    email,
    gender,
  });
};

/** Fired on a successful login. */
export const trackLogin = ({userId, email, gender} = {}) => {
  sendCustomEvent('Login', {
    method: 'email',
    user_id: userId != null ? String(userId) : undefined,
    email,
    gender,
  });
};

/**
 * Register the FCM/APNs token with Kochava. This is what powers uninstall
 * measurement -- Kochava sends silent pushes to the token and infers an
 * uninstall when delivery stops. There is no "uninstall" event to send.
 */
export const registerKochavaPushToken = token => {
  try {
    if (!token) {
      return;
    }
    KochavaTracker.instance.setPushEnabled(true);
    KochavaTracker.instance.registerPushToken(String(token));
    console.log('Kochava: registered push token');
  } catch (e) {
    console.log('Kochava: failed to register push token', e);
  }
};

/** Fired when the user opens the app from a push notification. */
export const trackPushOpened = remoteMessage => {
  sendStandardEvent(KochavaTrackerEventType.PushOpened, {
    name: remoteMessage?.notification?.title,
    description: remoteMessage?.notification?.body,
    campaign_id: remoteMessage?.data?.campaign_id,
    message_id: remoteMessage?.messageId,
  });
};

/**
 * Fired on a completed purchase.
 *
 * `paymentMethod` distinguishes real-money payments (card/Apple Pay/GPay) from
 * spending existing wallet balance -- see content_type below.
 */
export const trackPurchase = ({
  productId,
  name,
  amount,
  currency = 'QAR',
  paymentMethod,
  contentType,
  orderId,
} = {}) => {
  sendStandardEvent(KochavaTrackerEventType.Purchase, {
    content_id: productId != null ? String(productId) : undefined,
    name,
    price: typeof amount === 'number' ? amount : Number(amount) || undefined,
    currency,
    content_type: contentType,
    order_id: orderId,
    payment_method: paymentMethod,
  });
};

/**
 * Custom event: a package paid for with existing wallet balance. Deliberately
 * NOT a Purchase -- the money was already counted at wallet top-up, so sending
 * it as a Purchase would double-count revenue.
 */
export const trackPackageRedeemed = ({productId, name, amount} = {}) => {
  sendCustomEvent('Package Redeemed', {
    content_id: productId != null ? String(productId) : undefined,
    name,
    value: typeof amount === 'number' ? amount : Number(amount) || undefined,
    currency: 'QAR',
  });
};

/** Custom event: which package a user opened. */
export const trackPackageView = ({productId, name, amount} = {}) => {
  sendCustomEvent('Package View', {
    content_id: productId != null ? String(productId) : undefined,
    name,
    price: typeof amount === 'number' ? amount : Number(amount) || undefined,
    currency: 'QAR',
  });
};
