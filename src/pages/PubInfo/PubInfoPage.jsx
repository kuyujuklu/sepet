import { Text, View } from "native-base";
import PubInfoHeader from "../../widgets/Pub/PubInfoHeader";
import Wrapper from "../Wrapper";
import { useNavigation, useRoute } from "@react-navigation/native";
import MenuListForPub from "../../widgets/Menu/MenuListForPub";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoryList from "../../widgets/FoodCategories/CategoriesList/CategoryList";
import { createContext, useContext } from "react";
import DishListForCategory from "../../widgets/Dish/DishListForCategory";

export const PubInfoRouteContext = createContext();

const CategoriesScreen = () => {
  const contextValue = useContext(PubInfoRouteContext);
  const navigator = useNavigation();
  const route = useRoute();

  return (
      <CategoryList
        highlightedCategory={route?.params?.categoryID}
        selectCategory={(categoryID) => navigator.navigate("PubInfo/Dishes", {categoryID: categoryID})}
        pubID={contextValue?.pubID}
        menuID={contextValue?.selectedMenu}
      />
  );
};

const DishesScreen = () => {
  const contextValue = useContext(PubInfoRouteContext);
  const route = useRoute();


  return (
    <>
      {!(route?.params?.categoryID) && <Text>FUUUUUUUUUUUCK</Text>}
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

  console.log("selected menu: ", selectedMenu)

  const Stack = createNativeStackNavigator();

  return (
    <Wrapper>
      <View>
        <PubInfoHeader pubID={pubID} />
      </View>

      <View mb={5}>
        <MenuListForPub
          pubID={pubID}
          selectedMenu={selectedMenu}
          selectMenu={(menuID) =>
            navigator.navigate("PubInfo", {
              screen: "PubInfo/Categories",
              params: {
                selectedMenu: menuID,
              },
              pubID: pubID,
              selectedMenu: menuID,
            })
          }
        />
      </View>

      <PubInfoRouteContext.Provider
        value={{ pubID: pubID, selectedMenu: selectedMenu, categoryID: categoryID }}
      >
        <Stack.Navigator
          initialRouteName="PubInfo/Categories"
          screenOptions={{headerShown: false }}
        >
          {/* Categories */}
          <Stack.Screen
            name="PubInfo/Categories"
            options={{contentStyle:{backgroundColor: "transparent"}, headerShown: false }}
            component={CategoriesScreen}
          />
          {/* Dishes */}
          <Stack.Screen
            name="PubInfo/Dishes"
            options={{contentStyle:{backgroundColor: "transparent"}, headerShown: false}}
            component={DishesScreen}
          />
        </Stack.Navigator>
      </PubInfoRouteContext.Provider>
    </Wrapper>
  );
};

export default PubInfoPage;
