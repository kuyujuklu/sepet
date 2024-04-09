import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Navbar from "./src/widgets/Navbar/Navbar";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./src/features/store/configureStore";
import Registration from "./src/pages/Auth/Registration/Registration";
import { NativeBaseProvider, View } from "native-base";
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
import { navbarSelectIsEnabled } from "./src/features/store/navbar/navbarSlice";
import OrdersPage from "./src/pages/Orders/OrdersPage";
import SelectGeolocationPage from "./src/pages/Geolocation/SelectGeolocationPage";

export default function App() {
  return (
    <NativeBaseProvider>
      <Provider store={store}>
        <AppInner />
      </Provider>
    </NativeBaseProvider>
  );
}

const AppInner = () => {
  const Stack = createNativeStackNavigator();
  const isNavbarEnabled = useSelector(navbarSelectIsEnabled);

  useFonts({
    AnonymousProBold: require("./assets/fonts/AnonymousPro-Bold.ttf"),
    AnonymousProRegular: require("./assets/fonts/AnonymousPro-Regular.ttf"),
  });


  return (
    <NavigationContainer>
      <View style={{ flex: 14 }} pt="10">
        <Stack.Navigator
          initialRouteName="SelectGeolocationPage"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Registration" component={Registration} />
          <Stack.Screen name="SelectGeolocationPage" component={SelectGeolocationPage} />
          <Stack.Screen name="Authentication" component={Authentication} />
          <Stack.Screen name="FoodCategories" component={FoodCategoriesPage} />
          <Stack.Screen name="PubInfo" component={PubInfoPage} />
          <Stack.Screen name="Basket" component={BasketPage} />
          <Stack.Screen name="CreateOrder" component={CreateOrderPage} />
          <Stack.Screen name="Orders" component={OrdersPage} />
        </Stack.Navigator>
      </View>
      {isNavbarEnabled && <Navbar />}

      <ErrorHandlers />

      <AlertWrapper />

      <AuthWatcher />

      <GeolocationFinder />

      <ClearBasketPopup />
    </NavigationContainer>
  );
};
