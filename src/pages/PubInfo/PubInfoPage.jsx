import { Text, View } from "native-base";
import PubInfoHeader from "../../widgets/Pub/PubInfoHeader";
import Wrapper from "../Wrapper";
import { useNavigation, useRoute } from "@react-navigation/native";
import MenuListForPub from "../../widgets/Menu/MenuListForPub";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoryList from "../../widgets/FoodCategories/CategoriesList/CategoryList";
import { createContext, memo, useContext, useEffect, useState } from "react";
import DishListForCategory from "../../widgets/Dish/DishListForCategory";
import { useGetNearbyPubsQuery, useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";
import { Platform } from "react-native";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { useSelector } from "react-redux";

export const PubInfoRouteContext = createContext();

const CategoriesScreen = memo(() => {
  const contextValue = useContext(PubInfoRouteContext);
  const navigator = useNavigation();
  const route = useRoute();

  return (
    <View>
      <CategoryList
        highlightedCategory={route?.params?.categoryID}
        selectCategory={(categoryID) =>
          navigator.navigate("PubInfo/Dishes", { categoryID: categoryID })
        }
        pubID={contextValue?.pubID}
        menuID={contextValue?.selectedMenu}
      />
    </View>
  );
});

const DishesScreen = () => {
  const contextValue = useContext(PubInfoRouteContext);
  const route = useRoute();
  console.log("DISHES SCREEN: ", contextValue?.isAvailableForDelivery);

  return (
    <>
      <DishListForCategory
        pubID={contextValue?.pubID}
        categoryID={route?.params?.categoryID}
        isPubOpen={contextValue?.isOpen}
        isAvailableForDelivery={contextValue?.isAvailableForDelivery}
      />
    </>
  );
};

const PubInfoPage = () => {

  const location = useSelector(selectGeolocation);

  const {
    data: nearPubsData,
    error: nearPubsError,
    // isLoading: nearCategoriesIsLoading,
  } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location, pollingInterval: 20000 },
  );


  const route = useRoute();

  const selectedMenu = route?.params?.selectedMenu;
  const paramsPubID = route?.params?.pubID;
  const paramsPubName = route?.params?.pubName;
  useEffect(() => {
    if (paramsPubID) {
      setPubID(paramsPubID)
    }
    if (paramsPubName) {
      setPubName(paramsPubName)
    }
  }, [paramsPubID, paramsPubName])

  const [pubID, setPubID] = useState()
  const [pubName, setPubName] = useState()

  console.log("IN PUB NAME: ", pubName)
  const categoryID = route?.params?.categoryID;
  const navigator = useNavigation();

  const isAvailableForDelivery = !!(nearPubsData?.pubs?.find((pub) => pub.id === pubID));

  const {
    data: pubData,
    error: pubError,
    pubIsLoading,

  } = useGetPubInfoQuery(
    { pubID, pubName },
    { skip: (!pubID && !pubName), pollingInterval: 20000, skipPollingIfUnfocused: true },
  );

  useEffect(() => {
    console.log("PUBDATA: ", pubData);
    if (!pubData) return;

    setPubID(pubData.pub?.id)
    setPubName(pubData.pub?.url_name)

  }, [pubData])

  useEffect(() => {
    console.log("PUB INFO PAGE GETTING ERROR: ", pubError);
  }, [pubError])

  const Stack = createNativeStackNavigator();

  return (
    <Wrapper>
      <PubInfoRouteContext.Provider
        value={{
          pubID,
          selectedMenu,
          categoryID,
          isOpen: pubData?.pub?.isOpen,
          isAvailableForDelivery: isAvailableForDelivery,
        }}
      >
        <Stack.Navigator
          initialRouteName="PubInfo/Categories"
          screenOptions={{ headerShown: false }}
        >
          {/* Categories */}
          <Stack.Screen
            name="PubInfo/Categories"
            options={{
              contentStyle: { backgroundColor: "#f5f5f5" },
              headerShown: false,
            }}
            component={CategoriesScreen}
          />
          {/* Dishes */}
          <Stack.Screen
            name="PubInfo/Dishes"
            options={{
              contentStyle: { backgroundColor: "#f5f5f5" },
              headerShown: false,
            }}
            component={DishesScreen}
          />
        </Stack.Navigator>
        <View mb={Platform.OS === "ios" ? 75 : 60} position={"absolute"} bottom={0}>
          <MenuListForPub
            pubID={pubID}
            menus={pubData?.menus}
            selectedMenu={selectedMenu}
            selectMenu={(menuID) =>
              navigator.navigate("PubInfo", {
                screen: "PubInfo/Categories",
                params: {
                  selectedMenu: menuID,
                  categoryID: null,
                },
                pubID,
                selectedMenu: menuID,
              })
            }
          />
        </View>
      </PubInfoRouteContext.Provider>
    </Wrapper>
  );
};

export default PubInfoPage;
