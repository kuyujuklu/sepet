import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import BottomSheet from "../Common/BottomSheet";
import { topDishesFilters } from "../../shared/utils/topDishes";

// Not a feed filter but a view: it swaps the dish grid for the list of
// establishments, right here on the screen instead of navigating away.
export const PUBS_FILTER = "pubs";

const dishFilters = [
  { value: topDishesFilters.top, labelKey: "home_page.top_dishes.filter_top" },
  { value: topDishesFilters.deals, labelKey: "home_page.top_dishes.filter_deals" },
  { value: topDishesFilters.near, labelKey: "home_page.top_dishes.filter_near" },
];

const pubsFilter = {
  value: PUBS_FILTER,
  labelKey: "home_page.top_dishes.filter_pubs",
};

export const getFilterLabelKey = (value) =>
  [...dishFilters, pubsFilter].find((filter) => filter.value === value)
    ?.labelKey ?? dishFilters[0].labelKey;

const buttonStyles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#059669",
  },
  // The categories share the row with it, so the button takes as little of
  // that row as it can: one line, and no second line repeating the default
  label: { fontSize: 13, fontWeight: "bold", color: "#fff" },
  glyph: { fontSize: 13, color: "#fff" },
});

// The button that replaced the second carousel on the home screen. While the
// feed is in its default order it just says "filters"; as soon as something
// is applied it says what, because the filters themselves are now hidden
// inside the sheet.
export const FiltersButton = memo(({ selectedFilter, onPress, style }) => {
  const { t } = useTranslation();

  const isDefault = selectedFilter === dishFilters[0].value;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={style}>
      <View style={buttonStyles.button}>
        <Text style={buttonStyles.glyph}>☰</Text>

        <Text numberOfLines={1} style={buttonStyles.label}>
          {isDefault
            ? t("home_page.top_dishes.filters_button")
            : t(getFilterLabelKey(selectedFilter))}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const sheetStyles = StyleSheet.create({
  group: { gap: 8 },
  groupTitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
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
  divider: { height: 16 },
});

// One sheet for both questions the row used to ask: how to sort the dishes,
// and whether to look at places instead of dishes.
export const FiltersSheet = ({
  isOpened,
  onClose,
  selectedFilter,
  selectFilter,
  showPubsFilter = true,
}) => {
  const { t } = useTranslation();

  const renderRow = (filter) => {
    const isSelected = filter.value === selectedFilter;

    return (
      <TouchableOpacity
        key={filter.value}
        activeOpacity={0.85}
        onPress={() => {
          selectFilter(filter.value);
          onClose?.();
        }}
      >
        <View style={[sheetStyles.row, isSelected && sheetStyles.rowSelected]}>
          <Text
            style={[
              sheetStyles.rowLabel,
              isSelected && sheetStyles.rowLabelSelected,
            ]}
          >
            {t(filter.labelKey)}
          </Text>
          {isSelected && <Text style={sheetStyles.check}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet
      isOpened={isOpened}
      onClose={onClose}
      title={t("home_page.top_dishes.filters_title")}
      scrollable
    >
      <View style={sheetStyles.group}>
        <Text style={sheetStyles.groupTitle}>
          {t("home_page.top_dishes.filters_dishes_group")}
        </Text>
        {dishFilters.map(renderRow)}
      </View>

      {showPubsFilter && (
        <>
          <View style={sheetStyles.divider} />

          <View style={sheetStyles.group}>
            <Text style={sheetStyles.groupTitle}>
              {t("home_page.top_dishes.filters_pubs_group")}
            </Text>
            {renderRow(pubsFilter)}
          </View>
        </>
      )}
    </BottomSheet>
  );
};

export default FiltersSheet;
