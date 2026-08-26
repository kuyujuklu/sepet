import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  getSectionTitleKey,
  sectionsList,
} from "../../shared/utils/sections";
import {
  selectSection,
  setSection,
} from "../../features/store/sections/sectionSlice";
import {
  alertStatuses,
  pushAlert,
} from "../../features/store/alerts/alertSlice";
import { events, track } from "../../shared/analytics/analytics";

const styles = StyleSheet.create({
  // Scrolls: three sections with long names (Продукты / Alimente) do not fit
  // the width of a small phone and the last pill was cut off by the edge
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "#fff",
  },
  pillSelected: {
    backgroundColor: "#059669",
  },
  pillDisabled: {
    backgroundColor: "#e7e7e7",
  },
  icon: {
    width: 18,
    height: 18,
  },
  iconDisabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 13,
    color: "#3f3f46",
  },
  labelSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  labelDisabled: {
    color: "#8a8a8f",
  },
});

// Lets the client jump between food and flowers without going back to the
// picker. Sits in the top bar, under the address.
const SectionSwitcher = ({ screen, onChange }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedSection = useSelector(selectSection);

  const handlePress = (section) => {
    if (!section.available) {
      track(events.sectionUnavailable, { section: section.id, screen });
      dispatch(
        pushAlert({
          status: alertStatuses.info,
          delay: 2500,
          title: t("sections.coming_soon_alert"),
        }),
      );
      return;
    }

    if (section.id === selectedSection) return;

    track(events.sectionSelected, { section: section.id, source: screen });
    dispatch(setSection(section.id));
    // The category filter of the previous section makes no sense any more
    onChange?.(section.id);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {sectionsList.map((section) => {
        const isSelected = section.id === selectedSection;

        return (
          <TouchableOpacity
            key={section.id}
            activeOpacity={0.8}
            onPress={() => handlePress(section)}
          >
            <View
              style={[
                styles.pill,
                isSelected && styles.pillSelected,
                !section.available && styles.pillDisabled,
              ]}
            >
              <Image
                source={section.image}
                contentFit="contain"
                style={[styles.icon, !section.available && styles.iconDisabled]}
                alt=""
              />
              <Text
                style={[
                  styles.label,
                  isSelected && styles.labelSelected,
                  !section.available && styles.labelDisabled,
                ]}
              >
                {t(getSectionTitleKey(section.id))}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default SectionSwitcher;
