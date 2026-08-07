/**
 * Unit tests for the Kochava analytics helper.
 *
 * Scope: this verifies our app calls the CORRECT Kochava SDK method with the
 * correct event name/payload, and that a tracking failure never crashes the
 * caller. It runs in Node with a mocked native module, so it does NOT prove
 * events reach Kochava's servers — verify real delivery via the Kochava
 * dashboard (Event Manager) and the on-device KVA/Tracker debug logs.
 */

// Mock the native SDK so we can assert exactly how our code calls it.
jest.mock('react-native-kochava-tracker', () => ({
  KochavaTracker: {
    instance: {
      sendEventWithDictionary: jest.fn(),
    },
  },
}));

import {KochavaTracker} from 'react-native-kochava-tracker';
import {trackEvent} from '../src/utils/analytics';

const sendEventWithDictionary =
  KochavaTracker.instance.sendEventWithDictionary;

describe('trackEvent (Kochava)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a LOGIN event with the exact name and payload', () => {
    const result = trackEvent('LOGIN', {
      email: 'user@example.com',
      method: 'email',
    });

    expect(sendEventWithDictionary).toHaveBeenCalledTimes(1);
    expect(sendEventWithDictionary).toHaveBeenCalledWith('LOGIN', {
      email: 'user@example.com',
      method: 'email',
    });
    expect(result).toBe(true);
  });

  it('uses sendEventWithDictionary (v2 API), never the removed v1 configure/sendEvent-with-data', () => {
    trackEvent('SIGNUP', {method: 'google'});
    // The call went through the dictionary variant, which is the only one
    // that actually carries a payload in react-native-kochava-tracker v2.
    expect(sendEventWithDictionary).toHaveBeenCalledWith('SIGNUP', {
      method: 'google',
    });
  });

  it('defaults to an empty payload when data is omitted', () => {
    trackEvent('APP_OPEN');
    expect(sendEventWithDictionary).toHaveBeenCalledWith('APP_OPEN', {});
  });

  it('never throws and returns false when the SDK errors', () => {
    sendEventWithDictionary.mockImplementationOnce(() => {
      throw new Error('native bridge boom');
    });

    let result;
    expect(() => {
      result = trackEvent('LOGIN', {email: 'x@y.com', method: 'email'});
    }).not.toThrow();
    expect(result).toBe(false);
  });
});
