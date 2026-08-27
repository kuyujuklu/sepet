import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { defaultPubsSort } from "../Pub/PubsList";

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#fff",
  },
  label: { fontSize: 13, fontWeight: "bold", color: "#3f3f46" },
  glyph: { fontSize: 13, color: "#3f3f46" },
});

const sortLabelKeys = {
  rating: "home_page.top_dishes.sort_rating",
  distance: "home_page.top_dishes.sort_distance",
  speed: "home_page.top_dishes.sort_speed",
};

// Only shown next to FiltersButton while browsing establishments - a sort
// order over dishes would not mean anything (the dish feed has its own
// Хиты/Со скидкой chips for that already).
const SortButton = ({ sortBy, onPress, style }) => {
  const { t } = useTranslation();

  const label =
    sortBy && sortBy !== defaultPubsSort
      ? t(sortLabelKeys[sortBy])
      : t("home_page.top_dishes.sort_button");

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={style}>
      <View style={styles.button}>
        <Text style={styles.glyph}>↕</Text>

        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default memo(SortButton);
