import { StyleSheet, View } from "react-native";
import { getOrderStatusStep } from "../../../shared/utils/order-utils";

const TOTAL_STEPS = 5;

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 4 },
  segment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb" },
  segmentDone: { backgroundColor: "#059669" },
});

// A plain "how far along" bar under the status badge - the badge already
// names the stage, this just adds a sense of progress. Renders nothing for
// canceled/unknown status, which are not a point on this line.
const OrderStatusProgress = ({ status }) => {
  const step = getOrderStatusStep(status);

  if (step === null) return null;

  return (
    <View style={styles.row}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View key={i} style={[styles.segment, i <= step && styles.segmentDone]} />
      ))}
    </View>
  );
};

export default OrderStatusProgress;
