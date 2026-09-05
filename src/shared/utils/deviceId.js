import * as SecureStore from "expo-secure-store";
import uuid from "react-native-uuid";

// A UUID generated once per install and persisted locally, independent of
// login - the anchor push subscriptions key off of so a device's token can
// be registered before the person ever logs in (see backend's
// notificationservice.Subscribe). SecureStore, not AsyncStorage: it already
// holds the refresh token in this app (authBasedQuery.js), same persistence
// guarantees are wanted here - survives app restarts, cleared on uninstall.
const STORAGE_KEY = "push_device_id";

let cached = null;

export const getOrCreateDeviceId = async () => {
  if (cached) return cached;

  const existing = await SecureStore.getItemAsync(STORAGE_KEY);
  if (existing) {
    cached = existing;
    return existing;
  }

  const fresh = uuid.v4();
  await SecureStore.setItemAsync(STORAGE_KEY, fresh);
  cached = fresh;
  return fresh;
};
