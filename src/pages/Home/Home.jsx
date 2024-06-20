import { Text, View } from "native-base";
import PubsMap from "../../widgets/Maps/PubsMap";
import PubList from "../../widgets/Pub/PubList";
import { useState, useMemo } from "react";
import FoodCategoriesPlaceholder, {
  categoryNamesArray,
  placeholderCategories,
} from "../../widgets/FoodCategories/CategoriesNavbar/FoodCategoriesNavbar";
import Wrapper from "../Wrapper";
import { useTranslation } from "react-i18next";
import { useGetNearbyCategoriesQuery } from "../../shared/api/categories/categoriesApi";
import { useSelector } from "react-redux";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";

const Home = () => {
  const { t } = useTranslation();
  const [selectedPub, setSelectedPub] = useState(null);

  const location = useSelector(selectGeolocation);

  const {
    data: nearCategoriesData,
    error: nearCategoriesError,
    // isLoading: nearCategoriesIsLoading,
  } = useGetNearbyCategoriesQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location, pollingInterval: 20000 },
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
      if (categoryNamesSet.has(category.pub_id)) return;

      const pub = nearPubsData.pubs?.find((pub) => pub.id === category.pub_id);

      if (!pub) {
        categoriesWithNotValidPubs.add(category.pub_id);
        return;
      }

      if (placeholderCategories[category.category_type])
        categoryNamesSet.add(category.category_type);
    });

    return Array.from(categoryNamesSet);
  }, [nearCategoriesData, nearPubsData]);

  return (
    <Wrapper>
      <View px="5" pb="5">
        <Text
          fontWeight={"bold"}
          background={"#fff"}
          color="#111"
          fontSize={29}
        >
          {t("home_page.pubs_near_you")}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <PubsMap selectedPub={selectedPub} selectPub={setSelectedPub} />
      </View>
      <View mt={3}>
        <PubList selectedPub={selectedPub} selectPub={setSelectedPub} />
      </View>
      <View mt={4} mb="2" px={4}>
        <FoodCategoriesPlaceholder
          possibleCategoryNames={possibleCategoryNames}
        />
      </View>
    </Wrapper>
  );
};

export default Home;
