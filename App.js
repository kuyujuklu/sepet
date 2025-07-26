import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import "@/global.css";


import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Navbar from "./src/widgets/Navbar/Navbar";
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
import FoodCategoriesPage from "./src/pages/FoodCategories/FoodCategoriesPage";
import { useFonts } from "expo-font";
import PubInfoPage from "./src/pages/PubInfo/PubInfoPage";
import ClearBasketPopup from "./src/widgets/Basket/ClearBasketPopup";
import BasketPage from "./src/pages/Basket/BasketPage";
import CreateOrderPage from "./src/pages/CreateOrder/CreateOrderPage";
import { selectNavbarIsEnabled } from "./src/features/store/navbar/navbarSlice";
import OrdersPage from "./src/pages/Orders/OrdersPage";
import SelectGeolocationPage from "./src/pages/Geolocation/SelectGeolocationPage";
import OrdersPreloader from "./src/features/store/orders/OrdersPreloader";

import "./src/i18n/i18n.config";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NotificationHandler from "./src/features/store/notifications/NotificationHandler";
import { StatusBar } from "react-native";
import DishImagePopup from "./src/widgets/Dish/DishImagePopup";
import ChangePassword from "./src/pages/Auth/ChangePassword/ChangePassword";
import OrderInfoPage from "./src/pages/Orders/OrderInfoPage";
import { setSavedAddresses } from "./src/features/store/geolocation/geolocationSlice";
import InternetChecker from "./src/widgets/InternetChecker";
import NoInternetPage from "./src/pages/Internet/NoInternetPage";
import DeleteClientPopup from "./src/widgets/Client/DeleteClientPopup";

import LinkingWathcer from "./src/features/store/linking/LinkingWathcer";
import VersionWatcher from "./src/features/store/version/VersionWatcher.jsx";
import PubNotAvailableForDeliveryPopup from "./src/widgets/Pub/PubNotAvailableForDeliveryPopup";
import ExpiredVersionPage from "./src/pages/Version/ExpiredVersionPage.jsx";


export default function App() {
  return (
    <NativeBaseProvider>
      <Provider store={store}>
        <AppInner />
      </Provider>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
    </NativeBaseProvider>
  );
}

export const Screens = {
  Home: "Home",
  Registration: "Registration",
  Authentication: "Authentication",
  ChangePassword: "ChangePassword",
  SelectGeolocationPage: "SelectGeolocationPage",
  FoodCategories: "FoodCategories",
  PubInfo: "PubInfo",
  Basket: "Basket",
  CreateOrder: "CreateOrder",
  Orders: "Orders",
  OrderInfoPage: "OrderInfoPage",
  NoInternetPage: "NoInternetPage",
  ExpiredVersionPage: "ExpiredVersionPage",
}

const AppInner = () => {

  const isNavbarEnabled = useSelector(selectNavbarIsEnabled);

  const { i18n } = useTranslation();
  const dispatch = useDispatch();

  useFonts({
    AnonymousProBold: require("./assets/fonts/AnonymousPro-Bold.ttf"),
    AnonymousProRegular: require("./assets/fonts/AnonymousPro-Regular.ttf"),
  });
  const Stack = createNativeStackNavigator();

  const navigationRef = useNavigationContainerRef();
  const [routeName, setRouteName] = useState();

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
        setRouteName(navigationRef.getCurrentRoute().name);
      }}
      onStateChange={async () => {
        const previousRouteName = routeName;
        const currentRouteName = navigationRef.getCurrentRoute().name;
        const trackScreenView = () => {
          // Your implementation of analytics goes here!
        };

        if (previousRouteName !== currentRouteName) {
          // Save the current route name for later comparison
          setRouteName(currentRouteName);

          // Replace the line below to add the tracker from a mobile analytics SDK
          trackScreenView(currentRouteName);
        }
      }}
    >
      <Stack.Navigator
        initialRouteName={Screens.SelectGeolocationPage}
        screenOptions={{ headerShown: false }}
      >

        <Stack.Screen name={Screens.Home} component={Home} />
        <Stack.Screen
          name={Screens.SelectGeolocationPage}
          component={SelectGeolocationPage}
        />
        <Stack.Screen name={Screens.Registration} component={Registration} />
        <Stack.Screen name={Screens.Authentication} component={Authentication} />
        <Stack.Screen name={Screens.ChangePassword} component={ChangePassword} />
        <Stack.Screen name={Screens.FoodCategories} component={FoodCategoriesPage} />
        <Stack.Screen name={Screens.PubInfo} component={PubInfoPage} />
        <Stack.Screen name={Screens.Basket} component={BasketPage} />
        <Stack.Screen name={Screens.CreateOrder} component={CreateOrderPage} />
        <Stack.Screen name={Screens.Orders} component={OrdersPage} />
        <Stack.Screen name={Screens.OrderInfoPage} component={OrderInfoPage} />
        <Stack.Screen name={Screens.NoInternetPage} component={NoInternetPage} />
        <Stack.Screen name={Screens.ExpiredVersionPage} component={ExpiredVersionPage} />
      </Stack.Navigator>
      {isNavbarEnabled && <Navbar routeName={routeName} />}
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
      <DishImagePopup />
      <DeleteClientPopup />
      <PubNotAvailableForDeliveryPopup />
    </NavigationContainer >
  );
};
