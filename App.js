import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import "@/global.css";


import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./src/features/store/configureStore";
import Registration from "./src/pages/Auth/Registration/Registration";
import { NativeBaseProvider } from "native-base";
import ErrorHandlers from "./src/features/store/errorHandling/ErrorHandlers";
import AlertWrapper from "./src/widgets/Alerts/AlertWrapper";
import AuthWatcher from "./src/features/store/auth/AuthWatcher";
import Authentication from "./src/pages/Auth/Authentication/Authentication";
import Home from "./src/pages/Home/Home";
import GeolocationFinder from "./src/widgets/Geolocation/GeolocationFinder";
import { useFonts } from "expo-font";
import PubInfoPage from "./src/pages/PubInfo/PubInfoPage";
import ClearBasketPopup from "./src/widgets/Basket/ClearBasketPopup";
import BasketPage from "./src/pages/Basket/BasketPage";
import CreateOrderPage from "./src/pages/CreateOrder/CreateOrderPage";
import OrdersPage from "./src/pages/Orders/OrdersPage";
import ProfilePage from "./src/pages/Profile/ProfilePage";
import NotificationsPage from "./src/pages/Notifications/NotificationsPage";
import SelectGeolocationPage from "./src/pages/Geolocation/SelectGeolocationPage";
import SectionPickerPage from "./src/pages/Sections/SectionPickerPage";
import OrdersPreloader from "./src/features/store/orders/OrdersPreloader";

import { Screens } from "./src/app/navigation/screens";

import "./src/i18n/i18n.config";

import { useEffect, useMemo, useRef } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as NavigationBar from "expo-navigation-bar";
import { resolveDeepLinkDestination } from "./src/shared/utils/deepLink";
import { trackScreen } from "./src/shared/analytics/analytics";
import { useTranslation } from "react-i18next";
import NotificationHandler from "./src/features/store/notifications/NotificationHandler";
import { StatusBar } from "expo-status-bar";
import DishImagePopup from "./src/widgets/Dish/DishImagePopup";
import ChangePassword from "./src/pages/Auth/ChangePassword/ChangePassword";
import OrderInfoPage from "./src/pages/Orders/OrderInfoPage";
import { setSavedAddresses } from "./src/features/store/geolocation/geolocationSlice";
import { setNotificationsHistory } from "./src/features/store/notifications/notificationsHistorySlice";
import { readNotificationsHistory } from "./src/shared/utils/pushNotificationsHistory";
import InternetChecker from "./src/widgets/InternetChecker";
import NoInternetPage from "./src/pages/Internet/NoInternetPage";
import DeleteClientPopup from "./src/widgets/Client/DeleteClientPopup";
import RemoveDishPopup from "./src/widgets/Basket/RemoveDishPopup";

import LinkingWathcer from "./src/features/store/linking/LinkingWathcer";
import VersionWatcher from "./src/features/store/version/VersionWatcher.jsx";
import PubNotAvailableForDeliveryPopup from "./src/widgets/Pub/PubNotAvailableForDeliveryPopup";
import ExpiredVersionPage from "./src/pages/Version/ExpiredVersionPage.jsx";


// Logging is a real cost in production: every call serialises its arguments
// and crosses the bridge. The app logs whole API responses in places.
if (!__DEV__) {
  console.log = () => {};
  console.debug = () => {};
}

export default function App() {
  return (
    <>
      {/* Android runs edge-to-edge, so the status bar is drawn over the app:
          on the light background of every screen its icons have to be dark */}
      <StatusBar style="dark" />

      <NativeBaseProvider>
        <Provider store={store}>
          <AppInner />
        </Provider>
      </NativeBaseProvider>
    </>
  );
}

export { Screens };

const AppInner = () => {

  const { i18n } = useTranslation();
  const dispatch = useDispatch();

  useFonts({
    AnonymousProBold: require("./assets/fonts/AnonymousPro-Bold.ttf"),
    AnonymousProRegular: require("./assets/fonts/AnonymousPro-Regular.ttf"),
  });
  const Stack = createNativeStackNavigator();

  const navigationRef = useNavigationContainerRef();
  // onStateChange fires on every navigation; the ref is what keeps the
  // "did the screen actually change" check reliable across batched renders
  const previousRouteName = useRef(null);

  // useLinkingURL (unlike useURL) reads the launch URL through a synchronous
  // native call, so it is already known on this very first render - in time
  // to pick the Stack.Navigator's initialRouteName before it ever mounts.
  // That is what keeps a cold start from a deep link (e.g. a pub link shared
  // from the web) from flashing the section picker before redirecting: the
  // picker is simply never mounted.
  // initialRouteName/initialParams below are only ever read by
  // Stack.Navigator at mount time, so this must stay frozen at the value
  // useLinkingURL returned on the first render - recomputing it if a new
  // link arrives later (deps: []) would just be discarded by react-navigation
  // and would misleadingly suggest this reacts to warm-start links too.
  const initialUrl = Linking.useLinkingURL();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialDestination = useMemo(() => resolveDeepLinkDestination(initialUrl), []);

  // The app has no dark theme of its own - every screen is a light
  // background, always. With `userInterfaceStyle: "automatic"`, Android's
  // edge-to-edge nav bar buttons otherwise follow the *system* theme: on a
  // phone set to dark mode they render light/white and vanish against this
  // app's always-light screens (the status bar has the same fix already,
  // forced to "dark" above - this is the equivalent for the nav bar, which
  // has no such prop on <StatusBar>).
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync("dark").catch(() => {});
    }
  }, []);

  //i18n set language
  useEffect(() => {
    (async function() {
      try {
        const value = await AsyncStorage.getItem("lang");
        if (value !== null) {
          i18n.changeLanguage(value);
        }
      } catch (e) {
        console.log("getting lang error: ", e);
      }
    })();
  }, []);
  //load saved addresses
  useEffect(() => {
    (async function() {
      try {
        const value = await AsyncStorage.getItem("saved_addresses");
        if (value !== null) {
          const savedAddresses = JSON.parse(value);
          dispatch(setSavedAddresses({ addresses: savedAddresses }));
        }
      } catch (e) {
        console.log("getting lang error: ", e);
      }
    })();
  }, []);
  //load accumulated push notifications history
  useEffect(() => {
    readNotificationsHistory().then((history) => {
      dispatch(setNotificationsHistory(history));
    });
  }, []);


  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        const currentRouteName = navigationRef.getCurrentRoute()?.name;

        previousRouteName.current = currentRouteName;
        trackScreen(currentRouteName);
      }}
      onStateChange={async () => {
        const currentRouteName = navigationRef.getCurrentRoute()?.name;

        if (previousRouteName.current === currentRouteName) return;

        previousRouteName.current = currentRouteName;
        trackScreen(currentRouteName);
      }}
    >
      <Stack.Navigator
        // The app opens with the section question, not with an address form:
        // the location is guessed in the background and the exact address is
        // collected at checkout. But a cold start from a deep link (a pub
        // link shared from the web, an order link, ...) already knows where
        // it's going, so it skips the question and opens straight there.
        initialRouteName={initialDestination?.screen ?? Screens.SectionPicker}
        screenOptions={{ headerShown: false }}
      >

        <Stack.Screen name={Screens.SectionPicker} component={SectionPickerPage} />
        <Stack.Screen name={Screens.Home} component={Home} />
        <Stack.Screen
          name={Screens.SelectGeolocationPage}
          component={SelectGeolocationPage}
        />
        <Stack.Screen name={Screens.Registration} component={Registration} />
        <Stack.Screen name={Screens.Authentication} component={Authentication} />
        <Stack.Screen name={Screens.ChangePassword} component={ChangePassword} />
        <Stack.Screen
          name={Screens.PubInfo}
          component={PubInfoPage}
          initialParams={
            initialDestination?.screen === Screens.PubInfo
              ? initialDestination.params
              : undefined
          }
        />
        <Stack.Screen name={Screens.Basket} component={BasketPage} />
        <Stack.Screen name={Screens.CreateOrder} component={CreateOrderPage} />
        <Stack.Screen name={Screens.Orders} component={OrdersPage} />
        <Stack.Screen
          name={Screens.OrderInfoPage}
          component={OrderInfoPage}
          initialParams={
            initialDestination?.screen === Screens.OrderInfoPage
              ? initialDestination.params
              : undefined
          }
        />
        <Stack.Screen name={Screens.Profile} component={ProfilePage} />
        <Stack.Screen name={Screens.Notifications} component={NotificationsPage} />
        <Stack.Screen name={Screens.NoInternetPage} component={NoInternetPage} />
        <Stack.Screen name={Screens.ExpiredVersionPage} component={ExpiredVersionPage} />
      </Stack.Navigator>
      <ErrorHandlers />
      <OrdersPreloader />
      <AlertWrapper />
      <AuthWatcher />
      <LinkingWathcer />
      <VersionWatcher />
      <NotificationHandler />
      <InternetChecker />
      <GeolocationFinder />

      <ClearBasketPopup />
      <RemoveDishPopup />
      <DishImagePopup />
      <DeleteClientPopup />
      <PubNotAvailableForDeliveryPopup />
    </NavigationContainer >
  );
};
