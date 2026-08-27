import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useCategoryTypes } from "../../shared/hooks/useCategoryTypes";

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#059669",
  },
  label: { fontSize: 13, fontWeight: "bold", color: "#fff" },
  glyph: { fontSize: 13, color: "#fff" },
});

// Opens the sheet that holds both categories and the free-delivery filter
// (FiltersSheet). Was "Категории", opening only categories, until the
// free-delivery filter moved in with it - default label says "Фильтровать"
// now; as soon as something is picked, it says what, same as before.
const FiltersButton = ({ selectedCategory, freeDeliveryOnly, onPress, style }) => {
  const { t } = useTranslation();
  const { getName } = useCategoryTypes();

  const label = selectedCategory
    ? getName(selectedCategory)
    : freeDeliveryOnly
      ? t("home_page.top_dishes.filter_free_delivery")
      : t("home_page.top_dishes.filters_button");

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={style}>
      <View style={styles.button}>
        <Text style={styles.glyph}>☰</Text>

        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default memo(FiltersButton);
