import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import {
  getOrderStatusColors,
  getOrderStatusIcon,
  getOrderStatusText,
} from "../../../shared/utils/order-utils";
import { ConvertApiTimeToLocalHoursMinutes } from "../../../shared/utils/time";

const styles = StyleSheet.create({
  list: { gap: 0 },
  row: { flexDirection: "row", gap: 10 },
  rail: { width: 22, alignItems: "center" },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  line: { width: 2, flex: 1, minHeight: 14, backgroundColor: "#e5e7eb" },
  lineDone: { backgroundColor: "#a7f3d0" },
  body: { flex: 1, paddingBottom: 14 },
  status: { fontSize: 14, color: "#111", fontWeight: "500" },
  statusCurrent: { fontWeight: "bold" },
  time: { fontSize: 12, color: "#6b7280", marginTop: 1 },
});

// The order's own timeline, built from `status_history[]`: one row per
// transition the server actually recorded, with the time it happened.
//
// It replaces a single badge plus a five-segment progress bar that could only
// ever say "roughly this far" - the steps an order really went through are
// data now, so a client can see when the restaurant took it and when it went
// out with a courier.
//
// Renders nothing for an order from before the history was recorded; the
// caller falls back to the progress bar there.
const OrderStatusTimeline = ({ statusHistory = [] }) => {
  const { t } = useTranslation();

  if (!statusHistory.length) return null;

  return (
    <View style={styles.list}>
      {statusHistory.map((entry, index) => {
        const isLast = index === statusHistory.length - 1;
        const colors = getOrderStatusColors(entry?.status);
        const time = ConvertApiTimeToLocalHoursMinutes(entry?.time);

        return (
          <View key={`${entry?.status}-${index}`} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: colors.background }]}>
                <Ionicons
                  name={getOrderStatusIcon(entry?.status)}
                  size={13}
                  color={colors.color}
                />
              </View>
              {!isLast && <View style={[styles.line, styles.lineDone]} />}
            </View>

            <View style={styles.body}>
              <Text style={[styles.status, isLast && styles.statusCurrent]}>
                {t(getOrderStatusText(entry?.status))}
              </Text>
              {!!time && <Text style={styles.time}>{time}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default memo(OrderStatusTimeline);
