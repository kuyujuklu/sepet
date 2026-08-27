import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import BottomSheet from "../Common/BottomSheet";
import CategoryChip from "../FoodCategories/CategoriesCarousel/CategoryChip";
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
  divider: { height: 16 },
  groupTitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#fff",
  },
  rowSelected: { borderColor: "#059669", backgroundColor: "#ecfdf5" },
  rowLabel: { flex: 1, fontSize: 16, color: "#111" },
  rowLabelSelected: { fontWeight: "bold", color: "#047857" },
  check: { fontSize: 16, color: "#059669", fontWeight: "bold" },
});

// What replaced CategoriesSheet: the same category grid, plus a delivery
// filter underneath. The strip on the home screen only shows what fits in a
// carousel chip, so this is where a client actually narrows the feed down.
const FiltersSheet = ({
  isOpened,
  onClose,
  selectedCategory = "",
  possibleCategoryNames = [],
  onSelect,
  freeDeliveryOnly = false,
  onToggleFreeDelivery,
  screen,
}) => {
  const { t } = useTranslation();

  const categorySlugs = ["", ...sortCategoryNames(possibleCategoryNames)];

  const handleSelectCategory = (slug) => {
    const nextSlug = slug && slug === selectedCategory ? "" : slug;

    track(events.categorySelected, { category: nextSlug || "all", screen });

    onSelect?.(nextSlug);
    // Picking a category is the point of the row - close the sheet
    onClose?.();
  };

  const handleToggleFreeDelivery = () => {
    track(events.feedFilterChanged, {
      filter_type: "free_delivery",
      value: !freeDeliveryOnly,
    });

    onToggleFreeDelivery?.();
    onClose?.();
  };

  return (
    <BottomSheet
      id="filters"
      isOpened={isOpened}
      onClose={onClose}
      title={t("home_page.top_dishes.filters_button")}
      subtitle={t("home_page.top_dishes.filters_sheet_subtitle")}
      scrollable
    >
      <View style={styles.grid}>
        {categorySlugs.map((slug) => (
          <CategoryChip
            key={slug || "all"}
            slug={slug}
            image={getCategoryImage(slug)}
            isSelected={slug === selectedCategory}
            onPress={() => handleSelectCategory(slug)}
          />
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.groupTitle}>
        {t("home_page.top_dishes.filters_delivery_group")}
      </Text>

      <TouchableOpacity activeOpacity={0.85} onPress={handleToggleFreeDelivery}>
        <View style={[styles.row, freeDeliveryOnly && styles.rowSelected]}>
          <Text
            style={[styles.rowLabel, freeDeliveryOnly && styles.rowLabelSelected]}
          >
            {t("home_page.top_dishes.filter_free_delivery")}
          </Text>
          {freeDeliveryOnly && <Text style={styles.check}>✓</Text>}
        </View>
      </TouchableOpacity>
    </BottomSheet>
  );
};

export default FiltersSheet;
