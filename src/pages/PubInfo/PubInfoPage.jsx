import { Text, View } from "native-base";
import PubInfoHeader from "../../widgets/Pub/PubInfoHeader";
import Wrapper from "../Wrapper";
import { useNavigation, useRoute } from "@react-navigation/native";
import MenuListForPub from "../../widgets/Menu/MenuListForPub";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoryList from "../../widgets/FoodCategories/CategoriesList/CategoryList";
import { createContext, memo, useContext } from "react";
import DishListForCategory from "../../widgets/Dish/DishListForCategory";
import { useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";

export const PubInfoRouteContext = createContext();

const CategoriesScreen = memo(() => {
  const contextValue = useContext(PubInfoRouteContext);
  const navigator = useNavigation();
  const route = useRoute();
  console.log("Rerendered");
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

  return (
    <>
      <DishListForCategory
        pubID={contextValue?.pubID}
        categoryID={route?.params?.categoryID}
      />
    </>
  );
};

const PubInfoPage = () => {
  const route = useRoute();

  const selectedMenu = route?.params?.selectedMenu;
  const pubID = route?.params?.pubID;
  const categoryID = route?.params?.categoryID;
  const navigator = useNavigation();

  const {
    data: pubData,
    error: pubError,
    pubIsLoading,
  } = useGetPubInfoQuery(
    { pubID },
    { skip: !pubID, pollingInterval: 20000, skipPollingIfUnfocused: true },
  );

  const Stack = createNativeStackNavigator();

  return (
    <Wrapper>
      <View></View>

      <PubInfoRouteContext.Provider
        value={{
          pubID,
          selectedMenu,
          categoryID,
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
              contentStyle: { backgroundColor: "transparent" },
              headerShown: false,
            }}
            component={CategoriesScreen}
          />
          {/* Dishes */}
          <Stack.Screen
            name="PubInfo/Dishes"
            options={{
              contentStyle: { backgroundColor: "transparent" },
              headerShown: false,
            }}
            component={DishesScreen}
          />
        </Stack.Navigator>
        <View mb={52} position={"absolute"} bottom={0}>
          <MenuListForPub
            pubID={pubID}
            menus={pubData?.menus}
            selectedMenu={selectedMenu}
            selectMenu={(menuID) =>
              navigator.navigate("PubInfo", {
                screen: "PubInfo/Categories",
                params: {
                  selectedMenu: menuID,
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
