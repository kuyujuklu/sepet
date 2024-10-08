import { Text, View } from "native-base";
import PubsMap from "../../widgets/Maps/PubsMap";
import PubList from "../../widgets/Pub/PubList";
import { useState, useMemo, useEffect } from "react";
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
import NoPubsPage from "./NoPubsPage";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { images } from "../../app/images/images";

const Home = () => {
  const { t } = useTranslation();
  const navigator = useNavigation();
  const [selectedPub, setSelectedPub] = useState(null);

  const location = useSelector(selectGeolocation);

  console.log("LOCATION: ", location);

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
      if (!category.category_types) return;
      if (!category?.visible) return;

      const pub = nearPubsData.pubs?.find((pub) => pub.id === category.pub_id);

      if (!pub) {
        categoriesWithNotValidPubs.add(category.pub_id);
        return;
      }

      for (const type of category.category_types) {
        if (placeholderCategories[type]) categoryNamesSet.add(type);
      }
    });

    return Array.from(categoryNamesSet);
  }, [nearCategoriesData, nearPubsData]);

  useEffect(() => {
    console.log("near pubs data", nearPubsData)
  }, [nearPubsData])

  return (
    <Wrapper>
      {nearPubsData && nearPubsData?.pubs?.length === 0 ? (
        <View flex={1}>
          <NoPubsPage />
        </View>
      ) : (
        <>
          <View px="5" pt="3">
            <TouchableOpacity
              style={{
                flexDirection: "row",
                gap: 5,
                alignItems:"center"
              }}
              onPress={() => navigator.navigate("SelectGeolocationPage")}
            >
              <View style={{width: 20, height: 20}}>
                <Image
                  source={images.Locaiton}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>

              <Text
                fontWeight={"medium"}
                background={"#fff"}
                color="emerald.600"
                fontSize={18}
                numberOfLines={1}
                mr={3}
              >
                {location.town + ", " + location.fullAddress}
              </Text>
            </TouchableOpacity>
          </View>
          <View px="5" pb="3">
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
        </>
      )}
    </Wrapper>
  );
};

export default Home;
