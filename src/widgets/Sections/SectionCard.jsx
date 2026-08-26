import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import {
  getSectionSubtitleKey,
  getSectionTitleKey,
} from "../../shared/utils/sections";

// Plain react-native styles: in native-base a bare number on a size prop is a
// token of the spacing scale, which silently breaks pixel geometry.
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardDisabled: {
    backgroundColor: "#f0f0f0",
    shadowOpacity: 0,
    elevation: 0,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecfdf5",
  },
  circleDisabled: {
    backgroundColor: "#e4e4e7",
  },
  icon: {
    width: 40,
    height: 40,
  },
  iconDisabled: {
    opacity: 0.45,
  },
  texts: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  titleDisabled: {
    color: "#71717a",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 17,
    color: "#6b7280",
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "#d4d4d8",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#52525b",
    textTransform: "uppercase",
  },
  chevron: {
    fontSize: 22,
    color: "#059669",
  },
});

// One choice on the first screen. An unavailable section stays visible on
// purpose - it tells the client the section is coming, instead of hiding it.
const SectionCard = ({ section, onPress }) => {
  const { t } = useTranslation();

  const isDisabled = !section?.available;

  return (
    <TouchableOpacity
      activeOpacity={isDisabled ? 1 : 0.85}
      onPress={() => onPress(section)}
    >
      <View style={[styles.card, isDisabled && styles.cardDisabled]}>
        <View style={[styles.circle, isDisabled && styles.circleDisabled]}>
          <Image
            source={section?.image}
            contentFit="contain"
            style={[styles.icon, isDisabled && styles.iconDisabled]}
            alt=""
          />
        </View>

        <View style={styles.texts}>
          <Text style={[styles.title, isDisabled && styles.titleDisabled]}>
            {t(getSectionTitleKey(section?.id))}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {t(getSectionSubtitleKey(section?.id))}
          </Text>

          {isDisabled && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t("sections.coming_soon")}</Text>
            </View>
          )}
        </View>

        {!isDisabled && <Text style={styles.chevron}>→</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default memo(SectionCard);
