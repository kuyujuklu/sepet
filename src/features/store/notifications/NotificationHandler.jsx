import { useState, useEffect, useRef } from 'react';
import { Linking, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { subscribeNotificationTokenOnServer } from '../../../shared/api/notifications-api/subscribe-token';
import { useDispatch, useSelector } from 'react-redux';
import { selectClient } from '../auth/authSlice';
import { useTranslation } from 'react-i18next';
import { appendNotificationToHistory } from '../../../shared/utils/pushNotificationsHistory';
import { events, track } from '../../../shared/analytics/analytics';
import { resolveDestinationFromFields } from '../../../shared/utils/deepLink';
import { usePubInfo } from '../../../shared/hooks/usePubInfo';
import {
  useMarkPushCampaignOpenedMutation,
  useMarkNotificationReceivedMutation,
  useMarkNotificationOpenedMutation,
} from '../../../shared/api/notifications-api/notificationsApi';
import { getDishPrices, getDishImagePath, isDishAvailable } from '../../../shared/utils/dish';
import { openDishImagePopup } from '../dishes/dishesSlice';
import { Screens } from '../../../app/navigation/screens';

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
  const navigation = useNavigation();
  const client = useSelector(selectClient)
  const { i18n } = useTranslation()

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(
    null
  );
  const notificationListener = useRef();
  const responseListener = useRef();

  const [markPushCampaignOpened] = useMarkPushCampaignOpenedMutation();
  // Generic counterpart of the mutation above, addressed by the push's own
  // recipient-row id instead of a campaign id - present on every individual
  // order/status push the backend sends (and on campaign pushes sent after
  // this existed). This is the real, server-confirmed "the device actually
  // saw this" signal - stronger than Expo's own delivery receipt, which only
  // confirms hand-off to APNs/FCM.
  const [markNotificationReceived] = useMarkNotificationReceivedMutation();
  const [markNotificationOpened] = useMarkNotificationOpenedMutation();

  // A tapped push whose deep link is a dish (data.path === "DishInfo") can't
  // resolve through resolveDestinationFromFields like the other cases below -
  // there is no dish screen to navigate to. Dishes only ever open as the
  // global DishImagePopup (see CLAUDE.md's "global popups" note), which
  // needs the dish object itself, not just its id - so this holds the
  // {pubID, dishID} from the tap until usePubInfo resolves the pub's dish
  // list, then the effect below opens the popup once and clears it. Same
  // hook PubInfoPage/LinkingWathcer use, so this shares their cache entry
  // rather than opening a second, coordinate-less one.
  const [pendingDishLink, setPendingDishLink] = useState(null);
  const { data: pendingPubData } = usePubInfo(
    { pubID: pendingDishLink?.pubID },
    { skip: !pendingDishLink }
  );

  useEffect(() => {
    if (!pendingDishLink || !pendingPubData?.pub || !pendingPubData?.dishes) return;

    const dish = pendingPubData.dishes.find((d) => d.id === pendingDishLink.dishID);
    setPendingDishLink(null);
    if (!dish) return; // stale/removed dish - nothing sensible to open

    const pub = pendingPubData.pub;
    const prices = getDishPrices(dish, pub);

    // Opened in the context of that pub's own menu (matching every other
    // call site - a dish popup is always triggered from within its pub's
    // page already), not wherever the tap happened to land the user.
    navigation.navigate(Screens.PubInfo, { pubID: pendingDishLink.pubID });
    dispatch(
      openDishImagePopup({
        imagePath: getDishImagePath(dish, { full: true }),
        dish,
        dishID: dish.id,
        pubID: pendingDishLink.pubID,
        commission: prices.commission,
        isAvailableForDelivery: pub.isAvailableForDelivery,
        isPubOpen: pub.isOpen,
        isDishAvailable: isDishAvailable(dish),
      })
    );
  }, [pendingDishLink, pendingPubData, navigation, dispatch]);

  // Shared by both the cold-start and warm-tap handlers below - a tap is a
  // tap regardless of which of expo-notifications' two APIs reported it.
  const handleNotificationTap = (tappedNotification) => {
    const data = tappedNotification?.request?.content?.data;
    if (!data) return;

    // Drives the "opened" column in the superadmin's send history - present
    // on every push a campaign sent (regardless of deep link type), absent
    // on the order-status pushes the backend already sends outside the
    // campaign system. Fire-and-forget: nothing below depends on it.
    if (data.campaignID) {
      markPushCampaignOpened({ campaignID: data.campaignID });
    }
    if (data.deliveryID) {
      markNotificationOpened({ deliveryID: data.deliveryID });
    }

    // Set by the push campaign's "external link" deep link - deliberately a
    // different key from `path` below, since it bypasses
    // resolveDestinationFromFields entirely rather than naming a screen.
    if (data.externalUrl) {
      Linking.openURL(data.externalUrl).catch(() => {});
      return;
    }

    if (data.path === 'DishInfo' && data.pubID && data.dishID) {
      setPendingDishLink({ pubID: Number(data.pubID), dishID: Number(data.dishID) });
      return;
    }

    // Covers Path=PubInfo/OrderInfoPage (with their id fields) and the bare
    // Screens[path] fallback (Home, Orders, Profile, ...) - all three already
    // work with zero changes here, since resolveDestinationFromFields
    // already handles them for the URL/redux-based deep-link paths.
    const destination = resolveDestinationFromFields({
      path: data.path ?? null,
      pubID: data.pubID ? Number(data.pubID) : null,
      pubName: data.pubName ?? null,
      orderID: data.orderID ? Number(data.orderID) : null,
    });
    if (destination) {
      navigation.navigate(destination.screen, destination.params);
    }
  };

  useEffect(() => {
    // This is where we handle notifications if the app was launched from one
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        appendNotificationToHistory(dispatch, response.notification);
        trackPushOpened(response.notification, "cold_start");
        handleNotificationTap(response.notification);
      }
    };

    checkInitialNotification();
  }, [])

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      // Never store the error itself as the "token" - registerForPushNotificationsAsync
      // rejecting here (permission request throwing, Android's FCM
      // TOO_MANY_REGISTRATIONS, ...) used to end up as the literal string
      // "Error: ..." going out through subscribeNotificationTokenOnServer below,
      // which the backend stored verbatim as if it were a real push token. Every
      // future send to that "subscription" fails at Expo (not even a delivery
      // failure - Expo rejects the shape outright), which is most of why a past
      // campaign's send success rate looked so low.
      .catch((error) => {
        console.log(error);
        setExpoPushToken('');
      });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      appendNotificationToHistory(dispatch, notification);
      trackPushReceived(notification);

      const deliveryID = notification?.request?.content?.data?.deliveryID;
      if (deliveryID) {
        markNotificationReceived({ deliveryID });
      }
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
      handleNotificationTap(response.notification);
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
