import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// One control for "how many of this do I want", used by every surface that can
// add a dish: the feed card, the menu row, the basket line and the dish popup.
// Finger-sized on purpose - the old 28-30px hit areas were hard to hit.
const sizes = {
  md: { height: 40, button: 42, radius: 20, sign: 22, count: 16, minCount: 22 },
  lg: { height: 48, button: 50, radius: 24, sign: 26, count: 18, minCount: 28 },
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  solid: { backgroundColor: "#059669" },
  light: { backgroundColor: "#f2f2f4" },
  button: { alignItems: "center", justifyContent: "center" },
  signSolid: { color: "#fff" },
  signLight: { color: "#111" },
  countSolid: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  countLight: { color: "#111", fontWeight: "bold", textAlign: "center" },
  addSolid: { backgroundColor: "#059669" },
  addDisabled: { backgroundColor: "#a1a1aa" },
});

const QuantityStepper = ({
  count = 0,
  onIncrease,
  onDecrease,
  size = "md",
  tone = "solid",
  canOrder = true,
}) => {
  const s = sizes[size] ?? sizes.md;
  const isSolid = tone === "solid";

  if (count <= 0) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onIncrease}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <View
          style={[
            styles.button,
            canOrder ? styles.addSolid : styles.addDisabled,
            { width: s.height, height: s.height, borderRadius: s.radius },
          ]}
        >
          <Text style={[styles.signSolid, { fontSize: s.sign, lineHeight: s.sign + 2 }]}>
            +
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.row,
        isSolid ? styles.solid : styles.light,
        { height: s.height, borderRadius: s.radius },
      ]}
    >
      <TouchableOpacity
        onPress={onDecrease}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 0 }}
      >
        <View style={[styles.button, { width: s.button * 0.78, height: s.height }]}>
          <Text
            style={[
              isSolid ? styles.signSolid : styles.signLight,
              { fontSize: s.sign, lineHeight: s.sign + 2 },
            ]}
          >
            −
          </Text>
        </View>
      </TouchableOpacity>

      <Text
        style={[
          isSolid ? styles.countSolid : styles.countLight,
          { fontSize: s.count, minWidth: s.minCount },
        ]}
      >
        {count}
      </Text>

      <TouchableOpacity
        onPress={onIncrease}
        hitSlop={{ top: 8, bottom: 8, left: 0, right: 8 }}
      >
        <View style={[styles.button, { width: s.button * 0.78, height: s.height }]}>
          <Text
            style={[
              isSolid ? styles.signSolid : styles.signLight,
              { fontSize: s.sign, lineHeight: s.sign + 2 },
            ]}
          >
            +
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default memo(QuantityStepper);
