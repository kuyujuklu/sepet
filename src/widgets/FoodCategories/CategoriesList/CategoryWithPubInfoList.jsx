import { FlatList, View } from "native-base";
import { useGetNearbyCategoriesQuery } from "../../../shared/api/categories/categoriesApi";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectGeolocation } from "../../../features/store/geolocation/geolocationSlice";
import CategoryCardWithPubInfo from "./CategoryCardWithPubInfo";
import { SafeAreaView, TouchableOpacity } from "react-native";
import { useGetNearbyPubsQuery } from "../../../shared/api/pubs/pubsApi";

const CategoryWithPubInfoList = ({ foodFilter, selectCategory }) => {
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
    // isLoading: nearPubsIsLoading,
  } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location },
  );

  // {category, pub} array
  const shownCategoriesAndPubs = useMemo(() => {
    if (!nearCategoriesData?.categories) return [];
    if (!nearPubsData?.pubs) return [];

    const filteredCategories = nearCategoriesData.categories.filter(
      (category) => {
        if (!foodFilter) return true;
        return category?.category_type === foodFilter;
      },
    );

    const alreadyAddedPubs = new Set();

    // for each category, find the pub that matches the pub_id
    let rawCategoryPubData = filteredCategories.map((category) => {
      const pub = nearPubsData.pubs.find(
        (pub) => pub.id === category.pub_id && !alreadyAddedPubs.has(pub.id),
      );

      if (!pub) return null; //skip categories without pubs

      alreadyAddedPubs.add(pub.id);

      return { category, pub };
    });

    rawCategoryPubData = rawCategoryPubData.filter((item) => item !== null);
    rawCategoryPubData.sort((a, b) => a.pub.distance - b.pub.distance);
    return rawCategoryPubData;
  }, [nearCategoriesData, nearPubsData, foodFilter]);

  useEffect(() => {}, [nearCategoriesData]);

  useEffect(() => {}, [nearCategoriesError]);

  return (
    <View gap={10}>
      <SafeAreaView style={{ paddingHorizontal: 10 }} edges={[]}>
        <FlatList
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                selectCategory({
                  id: item?.category?.id,
                  menu_id: item?.category?.menu_id,
                  pub_id: item?.pub?.id,
                })
              }
            >
              <CategoryCardWithPubInfo
                key={item?.category?.id}
                category={item?.category}
                pub={item?.pub}
                distance={item?.pub?.distance}
                usePubBg={!foodFilter}
              />
            </TouchableOpacity>
          )}
          data={shownCategoriesAndPubs || []}
          ItemSeparatorComponent={() => <View height={2} />}
        />
      </SafeAreaView>
    </View>
  );
};

export default CategoryWithPubInfoList;
