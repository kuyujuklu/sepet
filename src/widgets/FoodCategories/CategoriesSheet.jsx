import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import BottomSheet from "../Common/BottomSheet";
import CategoryChip from "./CategoriesCarousel/CategoryChip";
import {
  getCategoryImage,
  sortCategoryNames,
} from "../../shared/utils/foodCategories";
import { events, track } from "../../shared/analytics/analytics";

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
    columnGap: 8,
    justifyContent: "flex-start",
  },
});

// The whole category list at once. The strip on the home screen only shows
// what fits in half a row, so this is where a client actually browses.
const CategoriesSheet = ({
  isOpened,
  onClose,
  selectedCategory = "",
  possibleCategoryNames = [],
  onSelect,
  screen,
}) => {
  const { t } = useTranslation();

  const categorySlugs = ["", ...sortCategoryNames(possibleCategoryNames)];

  const handleSelect = (slug) => {
    const nextSlug = slug && slug === selectedCategory ? "" : slug;

    track(events.categorySelected, { category: nextSlug || "all", screen });

    onSelect?.(nextSlug);
    // Picking a category is the whole point of the sheet - close it
    onClose?.();
  };

  return (
    <BottomSheet
      isOpened={isOpened}
      onClose={onClose}
      title={t("categories.sheet_title")}
      subtitle={t("categories.sheet_subtitle")}
      scrollable
    >
      <View style={styles.grid}>
        {categorySlugs.map((slug) => (
          <CategoryChip
            key={slug || "all"}
            slug={slug}
            image={getCategoryImage(slug)}
            isSelected={slug === selectedCategory}
            onPress={() => handleSelect(slug)}
          />
        ))}
      </View>
    </BottomSheet>
  );
};

export default CategoriesSheet;
