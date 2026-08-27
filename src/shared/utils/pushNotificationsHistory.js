import AsyncStorage from "@react-native-async-storage/async-storage";
import { setNotificationsHistory } from "../../features/store/notifications/notificationsHistorySlice";

const STORAGE_KEY = "push_notifications_history";

// Unbounded growth was never asked for - this is a history, not a database.
const MAX_ITEMS = 100;

export const readNotificationsHistory = async () => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (!value) return [];

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.log("getting notifications history error: ", e);
    return [];
  }
};

// Records one push in the history the client sees in the app (Профиль →
// Уведомления), in AsyncStorage and in the store. `notification` is either an
// expo-notifications `Notification` (foreground receive, cold-start launch)
// or a `NotificationResponse.notification` (the client tapped it) - both
// carry the same `request.{identifier,content}` shape, so one function
// handles all three call sites in NotificationHandler. Deduplicated on
// `identifier`, because a tapped notification fires both the "received" and
// the "response" listener and would otherwise be recorded twice.
export const appendNotificationToHistory = async (dispatch, notification) => {
  const request = notification?.request;
  if (!request?.identifier) return;

  const history = await readNotificationsHistory();

  if (history.some((item) => item.id === request.identifier)) return;

  const record = {
    id: request.identifier,
    title: request.content?.title ?? "",
    body: request.content?.body ?? "",
    data: request.content?.data ?? null,
    receivedAt: Date.now(),
    read: false,
  };

  const nextHistory = [record, ...history].slice(0, MAX_ITEMS);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
  dispatch(setNotificationsHistory(nextHistory));
};

export const markNotificationsHistoryRead = async (dispatch) => {
  const history = await readNotificationsHistory();
  if (!history.some((item) => !item.read)) return;

  const nextHistory = history.map((item) => ({ ...item, read: true }));

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
  dispatch(setNotificationsHistory(nextHistory));
};

export const clearNotificationsHistory = async (dispatch) => {
  await AsyncStorage.removeItem(STORAGE_KEY);
  dispatch(setNotificationsHistory([]));
};
