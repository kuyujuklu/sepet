import AsyncStorage from "@react-native-async-storage/async-storage";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { events, track } from "../../shared/analytics/analytics";

// `gz` is Gagauz; the app calls it GAG in the interface
const languages = [
  { code: "ro", label: "RO" },
  { code: "ru", label: "RU" },
  { code: "gz", label: "GAG" },
];

// Plain react-native styles: a bare number on a native-base size prop is a
// spacing token, not pixels.
const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 18,
    backgroundColor: "#f2f2f4",
  },
  trackOnCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  optionSelected: { backgroundColor: "#059669" },
  optionCompact: { paddingVertical: 6, paddingHorizontal: 12 },
  label: { fontSize: 14, fontWeight: "500", color: "#3f3f46" },
  labelSelected: { color: "#fff", fontWeight: "bold" },
  labelCompact: { fontSize: 13 },
});

// One segmented control, used both in the profile and on the first screen, so
// the language always looks like the same control.
const SwitchLanguage = ({ fullWidth = true, compact = false, onCard = false, style }) => {
  const { i18n } = useTranslation();

  const changeLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem("lang", lang);
    } catch (e) {
      console.log("setting language error");
    }

    track(events.languageChanged, { language: lang });
    i18n.changeLanguage(lang);
  };

  // i18n reports "ru-RU" style tags too
  const current = i18n.language?.split("-")[0];

  return (
    <View style={[styles.track, onCard && styles.trackOnCard, style]}>
      {languages.map((language) => {
        const isSelected = current === language.code;

        return (
          <TouchableOpacity
            key={language.code}
            activeOpacity={0.8}
            style={fullWidth ? { flex: 1 } : undefined}
            onPress={() => changeLanguage(language.code)}
          >
            <View
              style={[
                styles.option,
                compact && styles.optionCompact,
                isSelected && styles.optionSelected,
              ]}
            >
              <Text
                style={[
                  styles.label,
                  compact && styles.labelCompact,
                  isSelected && styles.labelSelected,
                ]}
              >
                {language.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default memo(SwitchLanguage);
