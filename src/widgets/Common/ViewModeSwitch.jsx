import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SCREEN_PADDING } from "../../constants/layout";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8e8ea",
    borderRadius: 20,
    padding: 4,
    marginHorizontal: SCREEN_PADDING,
  },
  // No `flex: 1` here on purpose: with a flex child inside a flex
  // TouchableOpacity inside a row, the height could resolve to nothing and the
  // labels were clipped away. An explicit height is also easier to hit.
  option: {
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  optionSelected: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    lineHeight: 19,
    color: "#52525b",
    includeFontPadding: false,
  },
  labelSelected: { color: "#111", fontWeight: "bold" },
});

// A segmented control. Used wherever the same data can be shown in more than
// one way (dishes vs establishments, categories vs one list). Full width and
// finger-sized on purpose - it is a primary control on those screens.
const ViewModeSwitch = ({ value, options = [], onChange }) => (
  <View style={styles.row}>
    {options.map((option) => {
      const isSelected = option.id === value;

      return (
        <TouchableOpacity
          key={option.id}
          activeOpacity={0.8}
          style={{ flex: 1 }}
          onPress={() => !isSelected && onChange?.(option.id)}
        >
          <View style={[styles.option, isSelected && styles.optionSelected]}>
            <Text
              numberOfLines={1}
              style={[styles.label, isSelected && styles.labelSelected]}
            >
              {option.label}
            </Text>
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default memo(ViewModeSwitch);
