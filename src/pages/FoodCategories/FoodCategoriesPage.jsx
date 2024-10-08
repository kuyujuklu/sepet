import Wrapper from "../Wrapper";
import FoodCategoriesPlaceholder, {
  categoryNamesArray,
  placeholderCategories,
} from "../../widgets/FoodCategories/CategoriesNavbar/FoodCategoriesNavbar";
import { Text, View } from "native-base";
import { AnonymousProBold } from "../../constants/styles-constants";
import CategoryWithPubInfoList from "../../widgets/FoodCategories/CategoriesList/CategoryWithPubInfoList";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { categories } from "../../app/static-data/data";
import { useSelector } from "react-redux";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { useGetNearbyCategoriesQuery } from "../../shared/api/categories/categoriesApi";
import { useMemo } from "react";
import { useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";
import { Platform } from "react-native";

const translateFoodCategories = (foodCategory) => {
  switch (foodCategory) {
    case categories.Asian:
      return "categories.asian";
    case categories.Flowers:
      return "categories.flowers";
    case categories.Breakfast:
      return "categories.breakfast";
    case categories.Dessert:
      return "categories.dessert";
    case categories.FastFood:
      return "categories.fast_food";
    case categories.Grill:
      return "categories.grill";
    case categories.Pancakes:
      return "categories.pancakes";
    case categories.Pasta:
      return "categories.pasta";
    case categories.Soup:
      return "categories.soup";
    case categories.Alcohol:
      return "categories.alcohol";
    case categories.EastFood:
      return "categories.east_food";
    case categories.Flour:
      return "categories.flour";
    case categories.HomeFood:
      return "categories.home_food";
    case categories.Kebab:
      return "categories.kebab";
    case categories.Salad:
      return "categories.salad";
    case categories.Snacks:
      return "categories.snacks";
    case categories.Meat:
      return "categories.meat";
    default:
      return "categories.all_publishments";
  }
};

const FoodCategoriesPage = ({ route }) => {
  const { t } = useTranslation();
  const foodFilter = route?.params?.foodCategory ?? "";
  const navigator = useNavigation();

  const location = useSelector(selectGeolocation);

  const {
    data: nearCategoriesData,
    error: nearCategoriesError,
    // isLoading: nearCategoriesIsLoading,
  } = useGetNearbyCategoriesQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location },
  );

  const {
    data: nearPubsData,
    error: nearPubsError,
    // isLoading: nearCategoriesIsLoading,
  } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location, pollingInterval: 20000 },
  );

  const possibleCategoryNames = useMemo(() => {
    if (!nearCategoriesData) return [];
    if (!nearPubsData) return [];

    const categoryNamesSet = new Set();
    const categoriesWithNotValidPubs = new Set();

    nearCategoriesData.categories.forEach((category) => {
      if (categoriesWithNotValidPubs.has(category.pub_id)) return;

      if (!category?.category_types) return;
      if (!category?.visible) return;

      const pub = nearPubsData.pubs?.find((pub) => pub.id === category.pub_id);

      if (!pub) {
        categoriesWithNotValidPubs.add(category.pub_id);
        return;
      }

      for (const type of category.category_types) {
        if (placeholderCategories[type]) {
          categoryNamesSet.add(type);
        }
      }
    });

    return Array.from(categoryNamesSet);
  }, [nearCategoriesData, nearPubsData]);

  return (
    <Wrapper>
      <View flex={1} alignItems="center">
        <Text
          px={5}
          fontFamily={AnonymousProBold}
          fontSize={32}
          mb="2"
          textAlign="center"
          flexDir="row"
          flexWrap="wrap"
          alignItems="center"
        >
          <Text textTransform="capitalize" fontSize={32} fontFamily={AnonymousProBold}>
            {t(translateFoodCategories(foodFilter))}
          </Text>
        </Text>
        <View flex={1}>
          <CategoryWithPubInfoList
            selectCategory={(category) =>
              navigator.navigate("PubInfo", {
                screen: "PubInfo/Categories",
                params: {
                  categoryID: category?.id,
                },
                pubID: category?.pub_id,
                selectedMenu: category?.menu_id,
              })
            }
            foodFilter={foodFilter}
          />
        </View>
      </View>
      <View
        position="absolute"
        w="100%"
        bottom={Platform.OS === "ios" ? 75 : 60}
        zIndex="10"
        mt={4}
        mb="2"
        px={4}
      >
        <FoodCategoriesPlaceholder
          selectedCategory={foodFilter}
          possibleCategoryNames={possibleCategoryNames}
        />
      </View>
    </Wrapper>
  );
};

export default FoodCategoriesPage;
