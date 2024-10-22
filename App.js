import {
  NavigationContainer,
  useNavigation,
  useNavigationContainerRef,
  useRoute,
} from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Navbar from "./src/widgets/Navbar/Navbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./src/features/store/configureStore";
import Registration from "./src/pages/Auth/Registration/Registration";
import { NativeBaseProvider, Text, View } from "native-base";
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

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import NotificationHandler from "./src/features/store/notifications/NotificationHandler";
import { Platform, StatusBar, TouchableOpacity } from "react-native";
import DishImagePopup from "./src/widgets/Dish/DishImagePopup";
import ChangePassword from "./src/pages/Auth/ChangePassword/ChangePassword";
import OrderInfoPage from "./src/pages/Orders/OrderInfoPage";
import { setSavedAddresses } from "./src/features/store/geolocation/geolocationSlice";
import { useNetInfo } from "@react-native-community/netinfo";
import InternetChecker from "./src/widgets/InternetChecker";
import NoInternetPage from "./src/pages/Internet/NoInternetPage";
import DeleteClientPopup from "./src/widgets/Client/DeleteClientPopup";

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
    (async function () {
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
    (async function () {
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
          await trackScreenView(currentRouteName);
        }
      }}
    >
      <Stack.Navigator
        initialRouteName="SelectGeolocationPage"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Registration" component={Registration} />
        <Stack.Screen
          name="SelectGeolocationPage"
          component={SelectGeolocationPage}
        />
        <Stack.Screen name="Authentication" component={Authentication} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="FoodCategories" component={FoodCategoriesPage} />
        <Stack.Screen name="PubInfo" component={PubInfoPage} />
        <Stack.Screen name="Basket" component={BasketPage} />
        <Stack.Screen name="CreateOrder" component={CreateOrderPage} />
        <Stack.Screen name="Orders" component={OrdersPage} />
        <Stack.Screen name="OrderInfoPage" component={OrderInfoPage} />
        <Stack.Screen name="NoInternetPage" component={NoInternetPage} />
      </Stack.Navigator>
      {isNavbarEnabled && <Navbar routeName={routeName} />}

      <ErrorHandlers />

      <OrdersPreloader />

      <AlertWrapper />

      <AuthWatcher />

      <GeolocationFinder />

      <NotificationHandler />

      <ClearBasketPopup />
      <DishImagePopup />
      <DeleteClientPopup />
      <InternetChecker />
    </NavigationContainer>
  );
};
