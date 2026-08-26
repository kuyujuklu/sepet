import { useCallback, useEffect, useMemo, useRef } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import CategoryChip, {
  CHIP_HEIGHT,
  CHIP_SEPARATOR,
  CHIP_WIDTH,
  COMPACT_CHIP_HEIGHT,
} from "./CategoryChip";
import {
  getCategoryImage,
  sortCategoryNames,
} from "../../../shared/utils/foodCategories";
import { events, track } from "../../../shared/analytics/analytics";
import { SCREEN_PADDING } from "../../../constants/layout";

const ITEM_LENGTH = CHIP_WIDTH + CHIP_SEPARATOR;

const styles = StyleSheet.create({
  more: {
    height: COMPACT_CHIP_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#059669",
    backgroundColor: "#fff",
  },
  moreText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#047857",
  },
});

// Horizontal list of categories. A tap never navigates: the parent decides
// what it means, and today that always means filtering the list in place.
//
// `compact` is the half-width strip on the home screen: pills instead of the
// big icons, and a trailing button that opens the full list in a popup.
const CategoriesCarousel = ({
  selectedCategory = "",
  possibleCategoryNames = [],
  onSelect,
  onMore,
  compact = false,
  contentPadding = SCREEN_PADDING,
  screen,
}) => {
  const { t } = useTranslation();
  const flatListRef = useRef(null);

  // The "all" chip is the first item of the list, not a pinned element
  const categorySlugs = useMemo(
    () => ["", ...sortCategoryNames(possibleCategoryNames)],
    [possibleCategoryNames],
  );

  const handleSelect = (slug) => {
    // Tapping the active category again clears the filter
    const nextSlug = slug && slug === selectedCategory ? "" : slug;

    track(events.categorySelected, {
      category: nextSlug || "all",
      screen,
    });

    onSelect?.(nextSlug);
  };

  const scrollToSelected = useCallback(() => {
    if (!flatListRef.current) return;

    const index = categorySlugs.indexOf(selectedCategory);
    if (index < 0) return;

    flatListRef.current.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  }, [categorySlugs, selectedCategory]);

  useEffect(() => {
    scrollToSelected();
  }, [selectedCategory]);

  return (
    // Explicit height and full width: the row lives inside the header of
    // another (vertical) list, so it cannot take its size from its content
    <View
      style={{
        width: "100%",
        height: compact ? COMPACT_CHIP_HEIGHT : CHIP_HEIGHT,
      }}
    >
      <FlatList
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categorySlugs}
        keyExtractor={(slug) => slug || "all"}
        contentContainerStyle={{
          paddingHorizontal: contentPadding,
          alignItems: "flex-start",
        }}
        ItemSeparatorComponent={() => <View style={{ width: CHIP_SEPARATOR }} />}
        // The compact pills are sized by their caption, so there is no fixed
        // item length to compute an offset from
        getItemLayout={
          compact
            ? undefined
            : (_, index) => ({
                length: ITEM_LENGTH,
                offset: ITEM_LENGTH * index,
                index,
              })
        }
        onScrollToIndexFailed={() => {
          const wait = new Promise((resolve) => setTimeout(resolve, 250));
          wait.then(scrollToSelected);
        }}
        ListFooterComponent={
          onMore ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onMore}
              style={{ marginLeft: CHIP_SEPARATOR }}
            >
              <View style={styles.more}>
                <Text style={styles.moreText}>{t("categories.show_all")}</Text>
              </View>
            </TouchableOpacity>
          ) : null
        }
        renderItem={({ item: slug }) => (
          <CategoryChip
            slug={slug}
            image={getCategoryImage(slug)}
            isSelected={slug === selectedCategory}
            compact={compact}
            onPress={() => handleSelect(slug)}
          />
        )}
      />
    </View>
  );
};

export default CategoriesCarousel;
