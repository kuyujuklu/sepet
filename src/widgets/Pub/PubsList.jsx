import { useCallback, useMemo } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import PubCard from "./PubCard";
import { BigCardsSkeleton } from "../Skeletons/Skeleton";
import { useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";
import { useGetNearbyCategoriesQuery } from "../../shared/api/categories/categoriesApi";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { SCREEN_PADDING, CARD_GAP } from "../../constants/layout";
import { events, track } from "../../shared/analytics/analytics";

const styles = StyleSheet.create({
  empty: { paddingHorizontal: 32, paddingVertical: 40 },
  emptyText: { textAlign: "center", color: "#6b7280", fontSize: 16 },
});

export const pubsSortOptions = {
  rating: "rating",
  distance: "distance",
  // "Скорость доставки" - the upper bound of the pub's own delivery-time
  // estimate (shipping_time_to), because that is the number a client actually
  // waits up to, not the optimistic lower bound
  speed: "speed",
};

export const defaultPubsSort = pubsSortOptions.rating;

// Missing data sorts to the end no matter which order is picked, instead of
// unpredictably to the top (NaN/undefined comparisons are not reliable)
const sortComparators = {
  [pubsSortOptions.rating]: (a, b) => (+b?.rating || 0) - (+a?.rating || 0),
  [pubsSortOptions.distance]: (a, b) =>
    (+a?.distance || Infinity) - (+b?.distance || Infinity),
  [pubsSortOptions.speed]: (a, b) =>
    (+a?.shipping?.shipping_time_to || Infinity) -
    (+b?.shipping?.shipping_time_to || Infinity),
};

// The list of establishments that deliver to the client, filtered by the
// current section and (optionally) by a category slug. Same data as the
// dish feed, grouped by place instead of by dish.
const PubsList = ({
  sectionId,
  categorySlug = "",
  freeDeliveryOnly = false,
  sortBy = defaultPubsSort,
  ListHeaderComponent,
  paddingBottom = 110,
}) => {
  const { t } = useTranslation();
  const navigator = useNavigation();
  const location = useSelector(selectGeolocation);

  const {
    data: pubsData,
    isLoading: pubsAreLoading,
    isFetching: pubsAreFetching,
    refetch: refetchPubs,
  } = useGetNearbyPubsQuery(
    // `?section=` does the section filtering server-side, off the service
    // type set in the pub's own settings - the client no longer has to guess
    // a pub's section from the tags of its categories
    { coords: { lat: location?.lat, lng: location?.lng }, section: sectionId },
    { skip: !location },
  );

  const {
    data: categoriesData,
    isLoading: categoriesAreLoading,
    isFetching: categoriesAreFetching,
    refetch: refetchCategories,
  } = useGetNearbyCategoriesQuery(
    { coords: { lat: location?.lat, lng: location?.lng }, section: sectionId },
    { skip: !location || !categorySlug },
  );

  const refetch = useCallback(() => {
    refetchPubs();
    if (categorySlug) refetchCategories();
  }, [refetchPubs, refetchCategories, categorySlug]);

  // pub id -> its visible categories. Only the "filter by category" chip
  // needs this now; the section a pub belongs to comes off the pub itself.
  const categoriesByPub = useMemo(() => {
    const map = {};

    (categoriesData?.categories || []).forEach((category) => {
      if (!category?.visible) return;

      if (!map[category.pub_id]) map[category.pub_id] = [];
      map[category.pub_id].push(category);
    });

    return map;
  }, [categoriesData]);

  const pubs = useMemo(() => {
    if (!pubsData?.pubs) return [];

    const filtered = pubsData.pubs.filter((pub) => {
      const categoriesOfPub = categoriesByPub[pub.id] || [];

      if (categorySlug) {
        const matchesCategory = categoriesOfPub.some((category) =>
          category?.category_types?.includes(categorySlug),
        );
        if (!matchesCategory) return false;
      }

      // shipping_free_delivery_price is the threshold a pub waives delivery
      // above (the same field the basket screen shows "до бесплатной
      // доставки не хватает X" from) - a pub with no threshold set does not
      // offer free delivery at all
      if (freeDeliveryOnly && !(+pub?.shipping_free_delivery_price > 0)) {
        return false;
      }

      return true;
    });

    return [...filtered]
      .sort(sortComparators[sortBy] ?? sortComparators[defaultPubsSort])
      .sort((a, b) => (a.isOpen === b.isOpen ? 0 : a.isOpen ? -1 : 1));
  }, [pubsData, categoriesByPub, categorySlug, freeDeliveryOnly, sortBy]);

  const openPub = (pub) => {
    track(events.pubOpened, { pub_id: pub?.id, source: "pubs_list" });
    navigator.navigate("PubInfo", { pubID: pub?.id });
  };

  if (pubsAreLoading || !pubsData || (categorySlug && (categoriesAreLoading || !categoriesData))) {
    return (
      <View>
        {ListHeaderComponent}
        <BigCardsSkeleton count={3} />
      </View>
    );
  }

  return (
    <FlatList
      data={pubs}
      keyExtractor={(pub) => String(pub.id)}
      showsVerticalScrollIndicator={false}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={7}
      removeClippedSubviews
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={
        <RefreshControl
          refreshing={pubsAreFetching || (!!categorySlug && categoriesAreFetching)}
          onRefresh={refetch}
          tintColor="#059669"
          colors={["#059669"]}
        />
      }
      contentContainerStyle={{
        paddingHorizontal: SCREEN_PADDING,
        paddingBottom,
      }}
      ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {t("near_categories_page.nothing_found")}
          </Text>
        </View>
      }
      renderItem={({ item: pub }) => (
        <PubCard pub={pub} onPress={() => openPub(pub)} />
      )}
    />
  );
};

export default PubsList;
