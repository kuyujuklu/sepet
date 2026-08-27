import { Spinner, Text, View } from "native-base";
import {
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import TopDishCard from "./TopDishCard";
import { FiltersCarousel, PUBS_FILTER } from "./TopDishesFilters";
import FiltersButton from "./FiltersButton";
import FiltersSheet from "./FiltersSheet";
import SortButton from "./SortButton";
import SortSheet from "./SortSheet";
import DishSearchInput from "./DishSearchInput";
import {
  useTopDishes,
  MAX_PUBS_TO_LOAD,
  MAX_PUBS_FOR_SEARCH,
} from "./useTopDishes";
import { topDishesFilters } from "../../shared/utils/topDishes";
import PubsList, { defaultPubsSort } from "../Pub/PubsList";
import {
  getSectionFeedSubtitleKey,
  getSectionPubsLabelKey,
} from "../../shared/utils/sections";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { events, track } from "../../shared/analytics/analytics";
import { DishGridSkeleton } from "../Skeletons/Skeleton";
import { SCREEN_PADDING, CARD_GAP } from "../../constants/layout";

// The first cards of the default feed are marked as best sellers
const HITS_COUNT = 2;

// A search over up to 30 pubs' worth of menus is not free to rebuild on every
// keystroke - both guards exist for the same reason (a client mid-word typing
// "пицца" should not trigger three separate searches for "п"/"пи"/"пиц"):
// nothing runs until typing pauses for SEARCH_DEBOUNCE_MS, and even then not
// below MIN_SEARCH_QUERY_LENGTH characters, where matches would be so broad
// they are not useful anyway.
const SEARCH_DEBOUNCE_MS = 900;
const MIN_SEARCH_QUERY_LENGTH = 4;

const styles = StyleSheet.create({
  carouselRow: { paddingHorizontal: SCREEN_PADDING },
  filtersRow: {
    flexDirection: "row",
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
  showFiltersButton = true,
  showPubsFilter = true,
  paddingBottom = 100,
}) => {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const [filter, setFilter] = useState(topDishesFilters.top);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [areFiltersOpened, setAreFiltersOpened] = useState(false);
  const [pubsSort, setPubsSort] = useState(defaultPubsSort);
  const [isSortOpened, setIsSortOpened] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const listRef = useRef(null);

  // Rebuilding the feed remounts up to 40 cards with remote images, which is
  // far too slow to do inside the tap. The chips repaint immediately from the
  // urgent state; the list catches up with the deferred one.
  const feedCategory = useDeferredValue(selectedCategory);
  const deferredFilter = useDeferredValue(filter);
  // Not useDeferredValue here on purpose - that only deprioritizes a render
  // and still settles on every keystroke. Search needs an actual pause.
  const debouncedSearchQuery = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);
  const trimmedSearchQuery = debouncedSearchQuery.trim();
  const isSearchQueryReady = trimmedSearchQuery.length >= MIN_SEARCH_QUERY_LENGTH;

  // "Establishments" is a view, not a sort order - the feed keeps its own
  const isPubsView = filter === PUBS_FILTER;
  const feedFilter =
    deferredFilter === PUBS_FILTER ? topDishesFilters.top : deferredFilter;

  const isUpdating = isSearchActive
    ? debouncedSearchQuery !== searchQuery
    : !isPubsView &&
      (feedCategory !== selectedCategory || deferredFilter !== filter);

  const { dishes, isLoading, isRefreshing, refetch } = useTopDishes({
    filter: feedFilter,
    limit: 40,
    sectionId,
    categorySlug: feedCategory,
    searchQuery: isSearchActive && isSearchQueryReady ? debouncedSearchQuery : "",
    // Search looks across every nearby pub, not just the 8 already loaded
    // for the curated feed - only while it's actually open, so this never
    // costs anything until the client taps the icon
    maxPubs: isSearchActive ? MAX_PUBS_FOR_SEARCH : MAX_PUBS_TO_LOAD,
    // Establishments view still has no dishes to show - unless search is
    // open, in which case it needs dishes to search over regardless
    skip: isPubsView && !isSearchActive,
  });

  const cardWidth = (screenWidth - SCREEN_PADDING * 2 - CARD_GAP) / 2;

  // Otherwise a user deep in the feed sees an apparently empty screen
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [selectedCategory, filter, debouncedSearchQuery]);

  // Once the debounced query has actually produced results (or a confirmed
  // "nothing found"), the keyboard has served its purpose and just blocks
  // half the grid - hide it so the client can see/scroll what they searched
  // for without an extra tap.
  useEffect(() => {
    if (isSearchActive && isSearchQueryReady && !isLoading && !isUpdating) {
      Keyboard.dismiss();
    }
  }, [isSearchActive, isSearchQueryReady, isLoading, isUpdating]);

  const changeFilter = (nextFilter) => {
    track(events.feedFilterChanged, { filter_type: "view", value: nextFilter });
    // Any direct chip/button tap picks a plain view - a free-delivery filter
    // left over from the sheet would otherwise silently keep narrowing a
    // view the client no longer asked for it to narrow
    setFreeDeliveryOnly(false);
    setFilter(nextFilter);
  };

  // Free delivery is a pub attribute, so choosing it always means "show me
  // the establishments" - unlike changeFilter, turning it back off does not
  // bounce the client out of that view, it just stops narrowing it
  const toggleFreeDelivery = () => {
    setFreeDeliveryOnly((wasOn) => !wasOn);
    setFilter(PUBS_FILTER);
  };

  const pubsLabel = t(getSectionPubsLabelKey(sectionId));

  const activateSearch = () => {
    track(events.searchOpened, { screen: "Home" });
    setIsSearchActive(true);
  };

  const deactivateSearch = () => {
    setIsSearchActive(false);
    setSearchQuery("");
  };

  // The headline is a caption for what is already on the screen, so it
  // follows the filter rather than always saying "Хиты продаж": the
  // immediate `filter` (not the deferred one) so the text reacts to the tap
  // as fast as the chip's own highlight does, ahead of the feed catching up.
  // Nothing is shown for "Заведения" - the establishments view already
  // replaces the whole header context with a list of places. Same while
  // searching - the input row already says what is on screen.
  const renderTitle = () => {
    if (!showTitle || isSearchActive) return null;

    if (filter === topDishesFilters.top) {
      return (
        <View style={{ paddingHorizontal: SCREEN_PADDING }}>
          <Text fontWeight="bold" color="#111" fontSize={28}>
            {t("home_page.top_dishes.title")}
          </Text>
          <Text color="coolGray.500" fontSize={14}>
            {t(getSectionFeedSubtitleKey(sectionId))}
          </Text>
        </View>
      );
    }

    if (filter === topDishesFilters.deals) {
      return (
        <View style={{ paddingHorizontal: SCREEN_PADDING }}>
          <Text fontWeight="bold" color="#111" fontSize={28}>
            {t("home_page.top_dishes.deals_title")}
          </Text>
          <Text color="coolGray.500" fontSize={14}>
            {t("home_page.top_dishes.deals_subtitle")}
          </Text>
        </View>
      );
    }

    return null;
  };

  const listHeader = (
    <View pt="1" pb="3" gap={3}>
      {/* Sort chips + the section-aware "all establishments" chip - or, while
          search is active, the input takes the whole row instead (that is
          the "expands to cover the other buttons" the search was asked for) */}
      <View style={styles.carouselRow}>
        {isSearchActive ? (
          <DishSearchInput
            query={searchQuery}
            onChangeQuery={setSearchQuery}
            onCancel={deactivateSearch}
          />
        ) : (
          <FiltersCarousel
            selectedFilter={filter}
            onSelect={changeFilter}
            pubsLabel={pubsLabel}
            showPubsFilter={showPubsFilter}
            onSearchPress={activateSearch}
          />
        )}
      </View>

      {/* Categories + free delivery + establishment sort order are all
          questions about the *establishments* view specifically, so they
          only make sense - and only show - once that view is active, and
          never while search has taken over the row above */}
      {showFiltersButton && isPubsView && !isSearchActive && (
        <View style={styles.filtersRow}>
          <FiltersButton
            selectedCategory={selectedCategory}
            freeDeliveryOnly={freeDeliveryOnly}
            onPress={() => setAreFiltersOpened(true)}
          />
          <SortButton sortBy={pubsSort} onPress={() => setIsSortOpened(true)} />
        </View>
      )}

      {renderTitle()}
    </View>
  );

  const sheets = (
    <>
      <FiltersSheet
        isOpened={areFiltersOpened}
        onClose={() => setAreFiltersOpened(false)}
        screen="Home"
        selectedCategory={selectedCategory}
        possibleCategoryNames={possibleCategoryNames}
        onSelect={onSelectCategory}
        freeDeliveryOnly={freeDeliveryOnly}
        onToggleFreeDelivery={toggleFreeDelivery}
      />

      <SortSheet
        isOpened={isSortOpened}
        onClose={() => setIsSortOpened(false)}
        sortBy={pubsSort}
        onSelect={setPubsSort}
      />
    </>
  );

  // Establishments instead of dishes, on this very screen - unless search has
  // taken over, in which case it always means dishes (see the ask: results
  // stay product cards even if "Все заведения" was the active tab)
  if (isPubsView && !isSearchActive) {
    return (
      <>
        <PubsList
          sectionId={sectionId}
          categorySlug={selectedCategory}
          freeDeliveryOnly={freeDeliveryOnly}
          sortBy={pubsSort}
          ListHeaderComponent={listHeader}
          paddingBottom={paddingBottom}
        />
        {sheets}
      </>
    );
  }

  // Nothing to search for yet (either nothing typed, or fewer than
  // MIN_SEARCH_QUERY_LENGTH characters) - useTopDishes would otherwise just
  // hand back the curated feed for a query it was not given, which would
  // look like search is ignoring what was typed
  if (isSearchActive && !isSearchQueryReady) {
    return (
      <View pt="2">
        {listHeader}
        <View px="8" py="10" alignItems="center">
          <Text textAlign="center" color="coolGray.500" fontSize={16}>
            {t("home_page.top_dishes.search_prompt")}
          </Text>
        </View>
        {sheets}
      </View>
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
    if (isSearchActive) return t("home_page.top_dishes.search_no_results");
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

          {/* Not during search - a query that found nothing should stay a
              search, not a detour into establishments or clearing a category
              that has nothing to do with why nothing matched */}
          {!isSearchActive && (
            <>
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor="#059669"
            colors={["#059669"]}
          />
        }
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
              !isSearchActive &&
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
