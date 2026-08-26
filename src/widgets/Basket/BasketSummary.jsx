import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../shared/utils/dish";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  plainCard: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingBottom: 0,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#ececef",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontSize: 14, color: "#6b7280" },
  value: { fontSize: 14, color: "#111", fontWeight: "500" },
  free: { fontSize: 14, color: "#059669", fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#ececef", marginVertical: 2 },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: "#111" },
  totalValue: { fontSize: 19, fontWeight: "bold", color: "#111" },
  hint: {
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  hintText: { fontSize: 13, color: "#047857", lineHeight: 17 },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d1fae5",
    marginTop: 8,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 3, backgroundColor: "#059669" },
});

// Subtotal / delivery / total, plus the "X left for free delivery" nudge.
// `deliveryPrice === null` means we do not know it yet (the pub is not in the
// nearby list) - showing "0" there would be a lie.
// `plain` drops the white background: on checkout the summary already sits
// inside a card and a card inside a card reads as a mistake.
const BasketSummary = ({
  itemsPrice,
  deliveryPrice,
  currency,
  leftForFreeDelivery,
  freeDeliveryFrom,
  plain = false,
}) => {
  const { t } = useTranslation();

  const total = itemsPrice + (deliveryPrice ?? 0);

  const progress =
    freeDeliveryFrom > 0
      ? Math.max(0, Math.min(1, itemsPrice / freeDeliveryFrom))
      : 0;

  return (
    <View style={{ gap: 10 }}>
      {leftForFreeDelivery > 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            {t("basket_page.free_delivery_left", {
              amount: `${formatPrice(leftForFreeDelivery)} ${currency}`,
            })}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      )}

      <View style={[styles.card, plain && styles.plainCard]}>
        <View style={styles.row}>
          <Text style={styles.label}>{t("basket_page.subtotal")}</Text>
          <Text style={styles.value}>
            {formatPrice(itemsPrice)} {currency}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("basket_page.delivery")}</Text>
          {deliveryPrice === null ? (
            <Text style={styles.value}>—</Text>
          ) : deliveryPrice === 0 ? (
            <Text style={styles.free}>{t("basket_page.delivery_free")}</Text>
          ) : (
            <Text style={styles.value}>
              {formatPrice(deliveryPrice)} {currency}
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.totalLabel}>{t("basket_page.total")}</Text>
          <Text style={styles.totalValue}>
            {formatPrice(total)} {currency}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default memo(BasketSummary);
