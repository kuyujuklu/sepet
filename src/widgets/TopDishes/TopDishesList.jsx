import { Spinner, Text, View } from "native-base";
import { FlatList, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import TopDishCard from "./TopDishCard";
import { FiltersButton, FiltersSheet, PUBS_FILTER } from "./TopDishesFilters";
import { useTopDishes } from "./useTopDishes";
import { topDishesFilters } from "../../shared/utils/topDishes";
import CategoriesCarousel from "../FoodCategories/CategoriesCarousel/CategoriesCarousel";
import CategoriesSheet from "../FoodCategories/CategoriesSheet";
import PubsList from "../Pub/PubsList";
import { getSectionFeedSubtitleKey } from "../../shared/utils/sections";
import { events, track } from "../../shared/analytics/analytics";
import { DishGridSkeleton } from "../Skeletons/Skeleton";
import { SCREEN_PADDING, CARD_GAP } from "../../constants/layout";

// The first cards of the default feed are marked as best sellers
const HITS_COUNT = 2;

const styles = StyleSheet.create({
  // Categories take the row, the filters button takes what it needs on the
  // right of them: a fixed half-and-half split cut the category strip down to
  // a chip and a half
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: SCREEN_PADDING,
  },
});

// Also used on the "all pubs" screen, which brings its own title and carousel -
// hence the switches.
const TopDishesList = ({
  sectionId,
  possibleCategoryNames,
  selectedCategory = "",
  onSelectCategory,
  showTitle = true,
  showCarousel = true,
  showPubsFilter = true,
  paddingBottom = 100,
}) => {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const [filter, setFilter] = useState(topDishesFilters.top);
  const [areFiltersOpened, setAreFiltersOpened] = useState(false);
  const [areCategoriesOpened, setAreCategoriesOpened] = useState(false);

  const listRef = useRef(null);

  // Rebuilding the feed remounts up to 40 cards with remote images, which is
  // far too slow to do inside the tap. The chips repaint immediately from the
  // urgent state; the list catches up with the deferred one.
  const feedCategory = useDeferredValue(selectedCategory);
  const deferredFilter = useDeferredValue(filter);

  // "Establishments" is a view, not a sort order - the feed keeps its own
  const isPubsView = filter === PUBS_FILTER;
  const feedFilter =
    deferredFilter === PUBS_FILTER ? topDishesFilters.top : deferredFilter;

  const isUpdating =
    !isPubsView &&
    (feedCategory !== selectedCategory || deferredFilter !== filter);

  const { dishes, isLoading } = useTopDishes({
    filter: feedFilter,
    limit: 40,
    sectionId,
    categorySlug: feedCategory,
    skip: isPubsView,
  });

  const cardWidth = (screenWidth - SCREEN_PADDING * 2 - CARD_GAP) / 2;

  // Otherwise a user deep in the feed sees an apparently empty screen
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [selectedCategory, filter]);

  const changeFilter = (nextFilter) => {
    track(events.feedFilterChanged, { filter: nextFilter });
    setFilter(nextFilter);
  };

  const hasCategories = possibleCategoryNames?.length > 0;

  const listHeader = (
    <View pt="1" pb="3" gap={3}>
      {/* The filters button is always here: it is the only way to reach the
          sort orders now that the second carousel is gone */}
      <View style={styles.controlsRow}>
        {showCarousel && hasCategories && (
          <View style={{ flex: 1 }}>
            <CategoriesCarousel
              compact
              contentPadding={0}
              screen="Home"
              selectedCategory={selectedCategory}
              possibleCategoryNames={possibleCategoryNames}
              onSelect={onSelectCategory}
              onMore={() => setAreCategoriesOpened(true)}
            />
          </View>
        )}

        <FiltersButton
          selectedFilter={filter}
          onPress={() => setAreFiltersOpened(true)}
        />
      </View>

      {/* Under the controls on purpose: the client came to browse, the
          headline is a caption for what is already on the screen */}
      {showTitle && (
        <View style={{ paddingHorizontal: SCREEN_PADDING }}>
          <Text fontWeight="bold" color="#111" fontSize={28}>
            {t("home_page.top_dishes.title")}
          </Text>
          <Text color="coolGray.500" fontSize={14}>
            {t(getSectionFeedSubtitleKey(sectionId))}
          </Text>
        </View>
      )}
    </View>
  );

  const sheets = (
    <>
      <FiltersSheet
        isOpened={areFiltersOpened}
        onClose={() => setAreFiltersOpened(false)}
        selectedFilter={filter}
        selectFilter={changeFilter}
        showPubsFilter={showPubsFilter}
      />

      <CategoriesSheet
        isOpened={areCategoriesOpened}
        onClose={() => setAreCategoriesOpened(false)}
        screen="Home"
        selectedCategory={selectedCategory}
        possibleCategoryNames={possibleCategoryNames}
        onSelect={onSelectCategory}
      />
    </>
  );

  // Establishments instead of dishes, on this very screen
  if (isPubsView) {
    return (
      <>
        <PubsList
          sectionId={sectionId}
          categorySlug={selectedCategory}
          ListHeaderComponent={listHeader}
          paddingBottom={paddingBottom}
        />
        {sheets}
      </>
    );
  }

  if (isLoading) {
    // The menus of up to 8 pubs are loaded in parallel; a skeleton grid keeps
    // the screen recognisable while that happens
    return (
      <View pt="2">
        {listHeader}
        <DishGridSkeleton cardWidth={cardWidth} count={6} />
        {sheets}
      </View>
    );
  }

  const getEmptyText = () => {
    if (feedCategory) return t("home_page.top_dishes.no_dishes_in_category");
    if (feedFilter === topDishesFilters.deals)
      return t("home_page.top_dishes.no_deals");

    return t("home_page.top_dishes.no_dishes");
  };

  const listEmpty = (
    <View px="8" py="10" alignItems="center" gap={4}>
      {isUpdating ? (
        <Spinner color="emerald.600" size="lg" />
      ) : (
        <>
          <Text textAlign="center" color="coolGray.500" fontSize={16}>
            {getEmptyText()}
          </Text>

          {/* Stays on the screen: shows the places instead of the dishes */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => changeFilter(PUBS_FILTER)}
          >
            <View backgroundColor="emerald.600" px="8" py="3" borderRadius="3xl">
              <Text color="#fff" fontWeight="medium">
                {t("home_page.top_dishes.filter_pubs")}
              </Text>
            </View>
          </TouchableOpacity>

          {!!selectedCategory && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onSelectCategory?.("")}
            >
              <Text color="coolGray.500" fontSize={14} underline>
                {t("home_page.top_dishes.show_all_dishes")}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  return (
    <>
      <FlatList
        ref={listRef}
        data={dishes}
        keyExtractor={(item) => item.key}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={4}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        columnWrapperStyle={{
          gap: CARD_GAP,
          paddingHorizontal: SCREEN_PADDING,
        }}
        contentContainerStyle={{ paddingBottom }}
        style={{ opacity: isUpdating ? 0.5 : 1 }}
        // style, not a native-base prop: height={12} would be token 12 = 48px
        ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
        renderItem={({ item, index }) => (
          <TopDishCard
            item={item}
            width={cardWidth}
            isHit={
              feedFilter === topDishesFilters.top &&
              !feedCategory &&
              index < HITS_COUNT
            }
          />
        )}
      />

      {sheets}
    </>
  );
};

export default TopDishesList;
