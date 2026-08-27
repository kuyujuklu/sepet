import { memo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { topDishesFilters } from "../../shared/utils/topDishes";

// Not a feed filter but a view: it swaps the dish grid for the list of
// establishments, right here on the screen instead of navigating away.
export const PUBS_FILTER = "pubs";

const dishFilters = [
  { value: topDishesFilters.top, labelKey: "home_page.top_dishes.filter_top" },
  { value: topDishesFilters.deals, labelKey: "home_page.top_dishes.filter_deals" },
];

// Same pill language as the compact CategoryChip - white/bordered by default,
// solid green when selected - so the two chip rows that occupy this spot
// (categories, before; this, now) never feel like two different apps.
const styles = StyleSheet.create({
  chip: {
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#fff",
  },
  chipSelected: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  label: { fontSize: 13, color: "#3f3f46" },
  labelSelected: { color: "#fff", fontWeight: "bold" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

const Chip = ({ label, isSelected, onPress }) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
    <View style={[styles.chip, isSelected && styles.chipSelected]}>
      <Text
        numberOfLines={1}
        style={[styles.label, isSelected && styles.labelSelected]}
      >
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

// Хиты · Со скидкой scroll on the left; Все рестораны/цветочные/продуктовые
// (section-dependent - the caller resolves the label, this component just
// renders whatever string it is given) is a fixed element pinned to the
// right, outside the scroll - it is not a sort of the same feed, it swaps
// the dish grid for the list of places, so it should never be one swipe away
// from scrolling out of sight.
const FiltersCarouselComponent = ({
  selectedFilter,
  onSelect,
  pubsLabel,
  showPubsFilter = true,
  onSearchPress,
  contentPadding = 0,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: contentPadding,
        }}
      >
        {dishFilters.map((filter) => (
          <Chip
            key={filter.value}
            label={t(filter.labelKey)}
            isSelected={filter.value === selectedFilter}
            onPress={() => onSelect(filter.value)}
          />
        ))}
      </ScrollView>

      {/* Between the sort chips and "Все X" on purpose - a fixed, unmissable
          icon rather than one more thing that can scroll out of sight */}
      {!!onSearchPress && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onSearchPress}
          accessibilityLabel={t("home_page.top_dishes.search_accessibility_label")}
        >
          <View style={styles.searchButton}>
            <Ionicons name="search" size={18} color="#3f3f46" />
          </View>
        </TouchableOpacity>
      )}

      {showPubsFilter && !!pubsLabel && (
        <Chip
          label={pubsLabel}
          isSelected={selectedFilter === PUBS_FILTER}
          onPress={() => onSelect(PUBS_FILTER)}
        />
      )}
    </View>
  );
};

export const FiltersCarousel = memo(FiltersCarouselComponent);

export default FiltersCarousel;
