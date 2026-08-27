import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../shared/utils/dish";

const styles = StyleSheet.create({
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

// The "X left for free delivery" nudge - shared by the basket summary and the
// floating basket bar (see getAmountLeftForFreeDelivery in
// shared/utils/basket.js) so both read the exact same threshold instead of
// two copies that could drift apart.
const FreeDeliveryHint = ({
  leftAmount,
  itemsPrice,
  freeDeliveryFrom,
  currency,
  style,
}) => {
  const { t } = useTranslation();

  if (!(leftAmount > 0)) return null;

  const progress =
    freeDeliveryFrom > 0
      ? Math.max(0, Math.min(1, itemsPrice / freeDeliveryFrom))
      : 0;

  return (
    <View style={[styles.hint, style]}>
      <Text style={styles.hintText}>
        {t("basket_page.free_delivery_left", {
          amount: `${formatPrice(leftAmount)} ${currency}`,
        })}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

export default memo(FreeDeliveryHint);
