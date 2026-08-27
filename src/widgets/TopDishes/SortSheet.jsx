import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import BottomSheet from "../Common/BottomSheet";
import { pubsSortOptions } from "../Pub/PubsList";
import { events, track } from "../../shared/analytics/analytics";

const styles = StyleSheet.create({
  group: { gap: 8 },
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

const options = [
  { value: pubsSortOptions.rating, labelKey: "home_page.top_dishes.sort_rating" },
  { value: pubsSortOptions.distance, labelKey: "home_page.top_dishes.sort_distance" },
  { value: pubsSortOptions.speed, labelKey: "home_page.top_dishes.sort_speed" },
];

// Establishments only - see SortButton for why. Single-select, always exactly
// one order active (unlike the free-delivery checkbox in FiltersSheet).
const SortSheet = ({ isOpened, onClose, sortBy, onSelect }) => {
  const { t } = useTranslation();

  const handleSelect = (value) => {
    track(events.feedFilterChanged, { filter_type: "pubs_sort", value });

    onSelect?.(value);
    onClose?.();
  };

  return (
    <BottomSheet
      id="sort"
      isOpened={isOpened}
      onClose={onClose}
      title={t("home_page.top_dishes.sort_sheet_title")}
    >
      <View style={styles.group}>
        {options.map((option) => {
          const isSelected = option.value === sortBy;

          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.85}
              onPress={() => handleSelect(option.value)}
            >
              <View style={[styles.row, isSelected && styles.rowSelected]}>
                <Text
                  style={[styles.rowLabel, isSelected && styles.rowLabelSelected]}
                >
                  {t(option.labelKey)}
                </Text>
                {isSelected && <Text style={styles.check}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </BottomSheet>
  );
};

export default SortSheet;
