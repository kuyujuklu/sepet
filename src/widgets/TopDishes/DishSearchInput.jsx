import { useEffect, useRef } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#059669",
    backgroundColor: "#fff",
  },
  input: { flex: 1, fontSize: 14, color: "#111", padding: 0 },
  clear: { padding: 2 },
  cancel: { fontSize: 14, fontWeight: "bold", color: "#059669" },
});

// The expanded state of the search row - replaces the whole carousel row
// (Хиты/Со скидкой/Все X) while active, rather than animating over it, since
// the ask was for it to cover the other buttons, not coexist with them.
const DishSearchInput = ({ query, onChangeQuery, onCancel }) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);

  useEffect(() => {
    // A beat after mount, or the keyboard sometimes never shows on Android
    const timeout = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <Ionicons name="search" size={16} color="#059669" />

        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={onChangeQuery}
          placeholder={t("home_page.top_dishes.search_placeholder")}
          placeholderTextColor="#9ca3af"
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
        />

        {!!query && (
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onChangeQuery("")}
            style={styles.clear}
          >
            <Ionicons name="close-circle" size={16} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={onCancel}>
        <Text style={styles.cancel}>{t("home_page.top_dishes.search_cancel")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DishSearchInput;
