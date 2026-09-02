import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { subscribeNotificationTokenOnServer } from '../../../shared/api/notifications-api/subscribe-token';
import { useDispatch, useSelector } from 'react-redux';
import { selectClient } from '../auth/authSlice';
import { useTranslation } from 'react-i18next';
import { appendNotificationToHistory } from '../../../shared/utils/pushNotificationsHistory';
import { events, track } from '../../../shared/analytics/analytics';

// Firebase's own "Messaging" report never sees these: it only auto-instruments
// notifications its native SDK receives directly, and this app gets pushes
// through expo-notifications (Expo's relay), which bypasses that entirely -
// Sends shows up there, Received/Impressions/Open never will, regardless of
// how many clients are on a build with this wired in. Tracking receive/open
// as regular events instead routes them through the sink this app already
// has (Firebase Analytics via firebaseAnalyticsSink.js), where they'll
// actually show up.
const trackPushReceived = (notification) =>
  track(events.pushReceived, {
    type: notification?.request?.content?.data?.type ?? null,
  });

const trackPushOpened = (notification, source) =>
  track(events.pushOpened, {
    type: notification?.request?.content?.data?.type ?? null,
    source,
  });

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function handleRegistrationError(errorMessage) {
  console.log(errorMessage)
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function NotificationHandler() {
  const dispatch = useDispatch();
  const client = useSelector(selectClient)
  const { i18n } = useTranslation()

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(
    null
  );
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // This is where we handle notifications if the app was launched from one
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        appendNotificationToHistory(dispatch, response.notification);
        trackPushOpened(response.notification, "cold_start");

        // You can navigate or handle data here
      }
    };

    checkInitialNotification();
  }, [])

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error) => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      appendNotificationToHistory(dispatch, notification);
      trackPushReceived(notification);
    });

    // Tapping a notification while the app is running (foreground or
    // background) fires this instead of/in addition to the listener above -
    // appendNotificationToHistory dedupes on the notification's own id, so
    // recording here too never double-counts one push. pushOpened has no
    // such dedup and isn't meant to: cold_start and "warm" are mutually
    // exclusive (a given launch is one or the other), never both for the
    // same tap.
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      appendNotificationToHistory(dispatch, response.notification);
      trackPushOpened(response.notification, "warm");
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (!client || !expoPushToken || !i18n.language) {
      return
    }

    subscribeNotificationTokenOnServer(client.phone, expoPushToken, i18n.language)
  }, [client, expoPushToken, i18n.language])

  return (<></>
  );
}
