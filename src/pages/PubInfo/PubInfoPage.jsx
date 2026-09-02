import { View } from "native-base";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { createContext, memo, useContext, useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import Wrapper from "../Wrapper";
import AppHeader from "../../widgets/AppHeader/AppHeader";
import CategoryList from "../../widgets/FoodCategories/CategoriesList/CategoryList";
import DishListForCategory from "../../widgets/Dish/DishListForCategory";
import FullMenuList from "../../widgets/Menu/FullMenuList";
import PubInfoPopup from "../../widgets/Pub/PubInfoPopup";
import ViewModeSwitch from "../../widgets/Common/ViewModeSwitch";
import BasketFloatingBar from "../../widgets/Basket/BasketFloatingBar";
import { usePubInfo } from "../../shared/hooks/usePubInfo";
import { useSafeBottomInset } from "../../shared/hooks/useSafeBottomInset";
import { SCREEN_PADDING } from "../../constants/layout";
import { events, track } from "../../shared/analytics/analytics";

const viewModes = {
  list: "list",
  categories: "categories",
};

const styles = StyleSheet.create({
  infoButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  infoButtonText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 16,
  },
  // The category view is a nested stack, so the back arrow of the screen
  // header pops the *outer* one and leaves the pub altogether. This is the
  // way back from a category to the list of categories.
  nestedBack: {
    alignSelf: "flex-start",
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 8,
  },
  nestedBackText: { fontSize: 14, fontWeight: "bold", color: "#059669" },
});

export const PubInfoRouteContext = createContext();

// Module scope: it used to be re-created on every render, which threw the
// whole nested navigator away on each state change
const Stack = createNativeStackNavigator();

const CategoriesScreen = memo(() => {
  const contextValue = useContext(PubInfoRouteContext);
  const navigator = useNavigation();
  const route = useRoute();

  return (
    <View flex={1}>
      <CategoryList
        highlightedCategory={route?.params?.categoryID}
        selectCategory={(categoryID) =>
          navigator.navigate("PubInfo/Dishes", { categoryID })
        }
        pubID={contextValue?.pubID}
        menuID={contextValue?.selectedMenu}
      />
    </View>
  );
});

const DishesScreen = () => {
  const { t } = useTranslation();
  const contextValue = useContext(PubInfoRouteContext);
  const route = useRoute();
  const navigator = useNavigation();

  return (
    <View flex={1}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.nestedBack}
        onPress={() => navigator.goBack()}
      >
        <Text style={styles.nestedBackText}>
          ← {t("categories.sheet_title")}
        </Text>
      </TouchableOpacity>

      <View flex={1}>
        <DishListForCategory
          pubID={contextValue?.pubID}
          categoryID={route?.params?.categoryID}
          isPubOpen={contextValue?.isOpen}
          isAvailableForDelivery={contextValue?.isAvailableForDelivery}
        />
      </View>
    </View>
  );
};

const PubInfoPage = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const basketBarBottom = useSafeBottomInset();

  const selectedMenu = route?.params?.selectedMenu;
  const categoryID = route?.params?.categoryID;
  const paramsPubID = route?.params?.pubID;
  const paramsPubName = route?.params?.pubName;

  const [pubID, setPubID] = useState();
  const [pubName, setPubName] = useState();

  useEffect(() => {
    if (paramsPubID) setPubID(paramsPubID);
    if (paramsPubName) setPubName(paramsPubName);
  }, [paramsPubID, paramsPubName]);

  // Coordinates go with the request now, so this one response answers
  // "does it deliver here", "how far is it" and what delivery costs - the
  // screen used to have to hold the nearby-pubs list next to it and merge
  // No raw polling here on purpose - a background timer re-fetching the
  // whole menu while someone is actively scrolling it is exactly the
  // disruption changes/2026-08-27-remove-background-polling.md removed.
  // refetchOnMountOrArgChange still catches "isOpen went stale while the
  // client was elsewhere" the moment they land back on this pub.
  const { data: pubData } = usePubInfo(
    { pubID, pubName },
    { refetchOnMountOrArgChange: 60 },
  );

  const isAvailableForDelivery = pubData?.pub?.isAvailableForDelivery !== false;

  useEffect(() => {
    if (!pubData) return;

    setPubID(pubData.pub?.id);
    setPubName(pubData.pub?.url_name);
  }, [pubData]);

  // The whole menu on one screen is the default: the client came to order, and
  // the category-by-category flow costs two taps before the first dish.
  const [viewMode, setViewMode] = useState(viewModes.list);
  const [isInfoOpened, setIsInfoOpened] = useState(false);

  const changeViewMode = (mode) => {
    track(events.viewModeChanged, { screen: "PubInfo", mode });
    setViewMode(mode);
  };

  return (
    <Wrapper>
      <AppHeader
        showBack
        showAddress={false}
        title={pubData?.pub?.name}
        // Everything about the place lives behind this button now, instead of
        // a text block above every list
        titleRight={
          !!pubData?.pub && (
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => setIsInfoOpened(true)}
            >
              <View style={styles.infoButton}>
                <Text style={styles.infoButtonText}>i</Text>
              </View>
            </TouchableOpacity>
          )
        }
      />

      <View py="2">
        <ViewModeSwitch
          value={viewMode}
          onChange={changeViewMode}
          options={[
            { id: viewModes.list, label: t("view_modes.as_list") },
            { id: viewModes.categories, label: t("view_modes.by_categories") },
          ]}
        />
      </View>

      <PubInfoRouteContext.Provider
        value={{
          pubID,
          selectedMenu,
          categoryID,
          isOpen: pubData?.pub?.isOpen,
          isAvailableForDelivery,
        }}
      >
        {viewMode === viewModes.list ? (
          <View flex={1}>
            <FullMenuList
              pubID={pubID}
              menus={pubData?.menus}
              isPubOpen={pubData?.pub?.isOpen}
              isAvailableForDelivery={isAvailableForDelivery}
            />
          </View>
        ) : (
          <Stack.Navigator
            initialRouteName="PubInfo/Categories"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen
              name="PubInfo/Categories"
              options={{
                contentStyle: { backgroundColor: "#f5f5f5" },
                headerShown: false,
              }}
              component={CategoriesScreen}
            />
            <Stack.Screen
              name="PubInfo/Dishes"
              options={{
                contentStyle: { backgroundColor: "#f5f5f5" },
                headerShown: false,
              }}
              component={DishesScreen}
            />
          </Stack.Navigator>
        )}

        {/* Same shortcut as on the feed: without it a dish added here has
            nowhere to lead. `bottom` is in `style`, not a bare native-base
            prop - a bare number there is a spacing-scale token, not pixels,
            and useSafeBottomInset() returns real pixels */}
        <View
          position="absolute"
          w="full"
          style={{
            paddingHorizontal: SCREEN_PADDING,
            paddingBottom: 12,
            bottom: basketBarBottom,
          }}
        >
          <BasketFloatingBar />
        </View>
      </PubInfoRouteContext.Provider>

      <PubInfoPopup
        pub={pubData?.pub}
        isOpened={isInfoOpened}
        onClose={() => setIsInfoOpened(false)}
      />
    </Wrapper>
  );
};

export default PubInfoPage;
