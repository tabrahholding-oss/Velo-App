import {KochavaTracker} from 'react-native-kochava-tracker';

/**
 * Send a Kochava event with a key/value payload.
 *
 * Analytics must NEVER crash or block the app, so any SDK failure is caught
 * and logged instead of thrown.
 *
 * NOTE: this only confirms the SDK call was made — it does not guarantee the
 * event reached Kochava's servers. Verify real delivery via the Kochava
 * dashboard (Event Manager) and the SDK debug logs (KVA/Tracker ...).
 *
 * @param {string} name  Event name, e.g. 'LOGIN'.
 * @param {object} data  Flat key/value payload.
 * @returns {boolean} true if the SDK call was invoked without throwing.
 */
export function trackEvent(name, data = {}) {
  try {
    KochavaTracker.instance.sendEventWithDictionary(name, data);
    return true;
  } catch (e) {
    console.log(`Kochava event "${name}" failed:`, e);
    return false;
  }
}
