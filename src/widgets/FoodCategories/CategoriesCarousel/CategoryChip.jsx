import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getCategoryCaptionKey } from "../../../shared/utils/foodCategories";

export const CHIP_WIDTH = 72;
export const CHIP_SEPARATOR = 8;
export const CHIP_HEIGHT = 94;

// The compact chip is a pill, so it only needs a height - the width comes
// from the caption
export const COMPACT_CHIP_HEIGHT = 40;

// Plain react-native styles on purpose: in native-base a bare number is a
// token of the spacing scale (width={72} would mean 288px), which silently
// blew this row apart.
const styles = StyleSheet.create({
  chip: {
    width: CHIP_WIDTH,
    alignItems: "center",
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ececec",
  },
  circleSelected: {
    backgroundColor: "#059669",
  },
  icon: {
    width: 32,
    height: 32,
  },
  caption: {
    marginTop: 6,
    width: CHIP_WIDTH,
    height: 30,
    fontSize: 11,
    lineHeight: 14,
    textAlign: "center",
    color: "#3f3f46",
  },
  captionSelected: {
    color: "#047857",
    fontWeight: "bold",
  },

  compactChip: {
    height: COMPACT_CHIP_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#fff",
  },
  compactChipSelected: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  compactIcon: {
    width: 20,
    height: 20,
  },
  compactCaption: {
    fontSize: 13,
    color: "#3f3f46",
  },
  compactCaptionSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});

// Round icon with a caption under it. The caption is the whole point: the
// icons alone are not readable for a first-time user.
//
// `compact` turns it into a one-line pill - that is what the half-width strip
// on the home screen uses; the full-size version now lives in the popup that
// shows every category at once.
const CategoryChip = ({ slug, image, isSelected, compact = false, onPress }) => {
  const { t } = useTranslation();

  if (compact) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <View style={[styles.compactChip, isSelected && styles.compactChipSelected]}>
          <Image
            source={image}
            contentFit="contain"
            style={styles.compactIcon}
            alt=""
          />
          <Text
            numberOfLines={1}
            style={[
              styles.compactCaption,
              isSelected && styles.compactCaptionSelected,
            ]}
          >
            {t(getCategoryCaptionKey(slug))}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View style={styles.chip}>
        <View style={[styles.circle, isSelected && styles.circleSelected]}>
          <Image
            source={image}
            contentFit="contain"
            style={styles.icon}
            alt=""
          />
        </View>

        {/* Fixed height so one- and two-line captions stay aligned */}
        <Text
          numberOfLines={2}
          style={[styles.caption, isSelected && styles.captionSelected]}
        >
          {t(getCategoryCaptionKey(slug))}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default memo(CategoryChip);
