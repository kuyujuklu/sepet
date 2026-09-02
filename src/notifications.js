import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

// Foreground alerts are suppressed while the WebView is open and visible -
// the web page already plays a sound over its own WebSocket connection when
// it's foregrounded (see admin-front's SoundPlayer.jsx), so a system banner
// on top of that would double-alert. App.js flips this with setForeground()
// based on AppState.
let isForeground = true;
export const setForeground = (value) => {
  isForeground = value;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: !isForeground,
    shouldPlaySound: !isForeground,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    console.log("Must use a physical device for push notifications");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.log("Permission not granted to get push token for push notification");
    return null;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) {
    console.log("Project ID not found");
    return null;
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch (e) {
    console.log("Error getting push token", e);
    return null;
  }
}
