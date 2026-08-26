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
import SelectGeolocationPage from "./src/pages/Geolocation/SelectGeolocationPage";
import SectionPickerPage from "./src/pages/Sections/SectionPickerPage";
import OrdersPreloader from "./src/features/store/orders/OrdersPreloader";

import { Screens } from "./src/app/navigation/screens";

import "./src/i18n/i18n.config";

import { useEffect, useRef } from "react";
import { trackScreen } from "./src/shared/analytics/analytics";
import { useTranslation } from "react-i18next";
import NotificationHandler from "./src/features/store/notifications/NotificationHandler";
import { StatusBar } from "expo-status-bar";
import DishImagePopup from "./src/widgets/Dish/DishImagePopup";
import ChangePassword from "./src/pages/Auth/ChangePassword/ChangePassword";
import OrderInfoPage from "./src/pages/Orders/OrderInfoPage";
import { setSavedAddresses } from "./src/features/store/geolocation/geolocationSlice";
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
        // collected at checkout
        initialRouteName={Screens.SectionPicker}
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
        <Stack.Screen name={Screens.PubInfo} component={PubInfoPage} />
        <Stack.Screen name={Screens.Basket} component={BasketPage} />
        <Stack.Screen name={Screens.CreateOrder} component={CreateOrderPage} />
        <Stack.Screen name={Screens.Orders} component={OrdersPage} />
        <Stack.Screen name={Screens.OrderInfoPage} component={OrderInfoPage} />
        <Stack.Screen name={Screens.Profile} component={ProfilePage} />
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
