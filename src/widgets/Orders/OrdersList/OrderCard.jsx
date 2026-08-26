import { useMemo } from "react";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import RateOrderButton from "./RateOrderButton";
import { useRepeatOrder } from "../useRepeatOrder";
import { images } from "../../../app/images/images";
import { Screens } from "../../../app/navigation/screens";
import { ConvertApiTimeToLocalDayMonthYear } from "../../../shared/utils/time";
import {
  getOrderStatusColors,
  getOrderStatusText,
} from "../../../shared/utils/order-utils";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  orderNumber: { flex: 1, fontSize: 14, color: "#6b7280" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  pubName: { fontSize: 18, fontWeight: "bold", color: "#111" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaIcon: { width: 15, height: 15, opacity: 0.55 },
  metaText: { fontSize: 13, color: "#6b7280" },
  divider: { height: 1, backgroundColor: "#f1f1f3" },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  repeat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
  },
  repeatIcon: { width: 15, height: 15 },
  repeatText: { fontSize: 13, fontWeight: "bold", color: "#047857" },
});

// One order in the list. The whole card opens the order; the two buttons at
// the bottom are the only things that do something else.
const OrderCard = ({ order }) => {
  const { t, i18n } = useTranslation();
  const navigator = useNavigation();

  const positionsCount = useMemo(
    () => order?.dishes?.reduce((acc, item) => acc + item.count, 0) ?? 0,
    [order],
  );

  const { repeatOrder, isLoading: isRepeatLoading } = useRepeatOrder(order);

  const status = getOrderStatusColors(order?.status);

  const goToOrderInfoPage = () => {
    if (!order) return;

    navigator.navigate(Screens.OrderInfoPage, { orderID: order.id });
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={goToOrderInfoPage}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.orderNumber} numberOfLines={1}>
            {t("order_page.order_card.order")} №{order?.id}
          </Text>

          <View style={[styles.badge, { backgroundColor: status.background }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>
              {t(getOrderStatusText(order?.status))}
            </Text>
          </View>
        </View>

        <Text style={styles.pubName} numberOfLines={1}>
          {order?.pub_name}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Image
              source={images.DishPlateBlack}
              style={styles.metaIcon}
              contentFit="contain"
              alt=""
            />
            <Text style={styles.metaText}>
              {positionsCount} {t("order_page.order_card.positions")}
            </Text>
          </View>

          <View style={styles.meta}>
            <Image
              source={images.CalendarBlack}
              style={styles.metaIcon}
              contentFit="contain"
              alt=""
            />
            <Text style={styles.metaText}>
              {ConvertApiTimeToLocalDayMonthYear(
                order?.created_time,
                i18n.language,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actions}>
          <RateOrderButton
            orderStatus={order?.status}
            rating={order?.rating}
            orderID={order?.id}
            iconSize={18}
            fontSize={14}
          />

          <TouchableOpacity activeOpacity={0.8} onPress={repeatOrder}>
            <View style={styles.repeat}>
              {isRepeatLoading ? (
                <ActivityIndicator size="small" color="#047857" />
              ) : (
                <Image
                  source={images.AgainBlack}
                  style={styles.repeatIcon}
                  contentFit="contain"
                  alt=""
                />
              )}
              <Text style={styles.repeatText}>
                {t("order_page.order_card.repeat_button")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;
