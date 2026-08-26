import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import PubCard from "./PubCard";
import { BigCardsSkeleton } from "../Skeletons/Skeleton";
import { useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";
import { useGetNearbyCategoriesQuery } from "../../shared/api/categories/categoriesApi";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { pubMatchesSection } from "../../shared/utils/sections";
import { SCREEN_PADDING, CARD_GAP } from "../../constants/layout";
import { events, track } from "../../shared/analytics/analytics";

const styles = StyleSheet.create({
  empty: { paddingHorizontal: 32, paddingVertical: 40 },
  emptyText: { textAlign: "center", color: "#6b7280", fontSize: 16 },
});

// The list of establishments that deliver to the client, filtered by the
// current section and (optionally) by a category slug. Same data as the
// dish feed, grouped by place instead of by dish.
const PubsList = ({
  sectionId,
  categorySlug = "",
  ListHeaderComponent,
  paddingBottom = 110,
}) => {
  const { t } = useTranslation();
  const navigator = useNavigation();
  const location = useSelector(selectGeolocation);

  const { data: pubsData, isLoading: pubsAreLoading } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location, pollingInterval: 20000, skipPollingIfUnfocused: true },
  );

  const { data: categoriesData, isLoading: categoriesAreLoading } =
    useGetNearbyCategoriesQuery(
      { coords: { lat: location?.lat, lng: location?.lng } },
      { skip: !location, pollingInterval: 20000, skipPollingIfUnfocused: true },
    );

  // pub id -> its visible categories, which is the only thing that says what
  // a pub sells (there is no type/section field on a pub)
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

      if (!pubMatchesSection(categoriesOfPub, sectionId)) return false;

      if (!categorySlug) return true;

      return categoriesOfPub.some((category) =>
        category?.category_types?.includes(categorySlug),
      );
    });

    return [...filtered]
      .sort((a, b) => a.distance - b.distance)
      .sort((a, b) => (a.isOpen === b.isOpen ? 0 : a.isOpen ? -1 : 1));
  }, [pubsData, categoriesByPub, sectionId, categorySlug]);

  const openPub = (pub) => {
    track(events.pubOpened, { pub_id: pub?.id, source: "pubs_list" });
    navigator.navigate("PubInfo", { pubID: pub?.id });
  };

  if (pubsAreLoading || categoriesAreLoading || !pubsData || !categoriesData) {
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
