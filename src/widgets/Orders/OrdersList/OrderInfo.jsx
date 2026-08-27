import { useEffect, useMemo } from "react";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import RateOrderButton from "./RateOrderButton";
import OrderStatusProgress from "./OrderStatusProgress";
import OrderStatusTimeline from "./OrderStatusTimeline";
import { useRepeatOrder } from "../useRepeatOrder";
import { selectOrders } from "../../../features/store/orders/ordersSlice";
import { ConvertApiTimeToLocalDayMonthYear } from "../../../shared/utils/time";
import {
  getOrderStatusColors,
  getOrderStatusIcon,
  getOrderStatusText,
} from "../../../shared/utils/order-utils";
import { getCurrencySymbol } from "../../../shared/utils/dish";
import { images } from "../../../app/images/images";
import { Screens } from "../../../app/navigation/screens";
import { SCREEN_PADDING } from "../../../constants/layout";
import { orderPaymentTypes } from "../../../app/static-data/data";

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 4,
    paddingBottom: 28,
    gap: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  date: { fontSize: 13, color: "#6b7280" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { width: 20, height: 20, opacity: 0.65 },
  pubName: { flex: 1, fontSize: 18, fontWeight: "bold", color: "#111" },
  address: { flex: 1, fontSize: 14, color: "#6b7280", lineHeight: 19 },

  cardTitle: { fontSize: 13, color: "#6b7280" },
  dishRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dishName: { flex: 1, fontSize: 15, color: "#111" },
  dishCount: { fontSize: 13, color: "#6b7280" },
  dishPrice: { fontSize: 15, fontWeight: "bold", color: "#111", minWidth: 78, textAlign: "right" },
  noDishes: { fontSize: 14, color: "#6b7280" },

  totalRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  totalLabel: { fontSize: 15, color: "#6b7280" },
  totalValue: { fontSize: 15, color: "#111" },
  grandLabel: { fontSize: 17, fontWeight: "bold", color: "#111" },
  grandValue: { fontSize: 17, fontWeight: "bold", color: "#047857" },
  divider: { height: 1, backgroundColor: "#f1f1f3" },

  support: {
    backgroundColor: "#fff7ed",
    borderRadius: 18,
    padding: 14,
  },
  supportText: { fontSize: 13, lineHeight: 19, color: "#9a3412" },
  supportLink: { fontWeight: "bold", textDecorationLine: "underline" },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
  },
  repeat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
  },
  repeatIcon: { width: 16, height: 16 },
  repeatText: { fontSize: 14, fontWeight: "bold", color: "#047857" },
});

// The order screen. Same cards, same gutter and the same status badge as the
// list it is opened from.
const OrderInfo = ({ orderID }) => {
  const { t, i18n } = useTranslation();
  const navigator = useNavigation();

  const orders = useSelector(selectOrders);

  const order = useMemo(
    () => orders?.find((item) => item.id === orderID),
    [orders, orderID],
  );

  // The order can disappear from under the screen (a websocket update, a
  // logout); there is nothing to show then
  useEffect(() => {
    if (!orders) return;
    if (!order) navigator.navigate(Screens.Orders);
  }, [order, orders]);

  const { repeatOrder, isLoading: isRepeatLoading } = useRepeatOrder(order);

  const currency = getCurrencySymbol(order?.pub?.currency_id);
  const status = getOrderStatusColors(order?.status);

  // Every line of the order carries its own `name` snapshot, taken when the
  // order was created - so this screen no longer loads the whole menu of the
  // pub just to print names, and an order still reads correctly after a dish
  // is taken off the menu.
  const dishes = useMemo(
    () =>
      (order?.dishes ?? []).map((orderDish, index) => ({
        key: `${orderDish.dish_id}-${index}`,
        name: orderDish.name,
        count: orderDish.count,
        price: orderDish.dish_price,
      })),
    [order],
  );

  // Totals the server calculated when the order was made, rather than the
  // client adding the lines up again and hoping it matches the receipt
  const itemsPrice = +order?.items_price || 0;
  const deliveryPrice = +order?.delivery_price || 0;
  const totalSum = +order?.total_price || itemsPrice + deliveryPrice;

  const statusHistory = order?.status_history ?? [];

  const address = [order?.town, order?.full_address].filter(Boolean).join(", ");

  // Entered by the client at checkout and sent on order creation - shown back
  // here if the API actually returns it on the order object (unconfirmed;
  // each row simply stays hidden if the field is absent, see the changes
  // note's Backend gaps section)
  const paymentTypeLabel =
    order?.payment_type === orderPaymentTypes.cash
      ? t("create_order_page.additional_data.inputs.payment_type.values.cash")
      : order?.payment_type === orderPaymentTypes.cardOffline
        ? t("create_order_page.additional_data.inputs.payment_type.values.card_offline")
        : null;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: status.background }]}>
            <Ionicons
              name={getOrderStatusIcon(order?.status)}
              size={13}
              color={status.color}
            />
            <Text style={[styles.badgeText, { color: status.color }]}>
              {t(getOrderStatusText(order?.status))}
            </Text>
          </View>

          <Text style={styles.date}>
            {ConvertApiTimeToLocalDayMonthYear(
              order?.created_time,
              i18n.language,
            )}
          </Text>
        </View>

        {/* The recorded transitions when the server has them; the old
            five-segment bar for orders from before it did */}
        {statusHistory.length > 0 ? (
          <OrderStatusTimeline statusHistory={statusHistory} />
        ) : (
          <OrderStatusProgress status={order?.status} />
        )}

        <View style={styles.row}>
          <Image
            source={images.KnifeInPlateBlack}
            style={styles.icon}
            contentFit="contain"
            alt=""
          />
          <Text style={styles.pubName} numberOfLines={2}>
            {order?.pub_name ?? order?.pub?.name}
          </Text>
        </View>

        {!!address && (
          <View style={styles.row}>
            <Image
              source={images.Locaiton}
              style={styles.icon}
              contentFit="contain"
              alt=""
            />
            <Text style={styles.address} numberOfLines={2}>
              {address}
            </Text>
          </View>
        )}

        {!!paymentTypeLabel && (
          <View style={styles.row}>
            <Ionicons
              name={
                order?.payment_type === orderPaymentTypes.cash
                  ? "cash-outline"
                  : "card-outline"
              }
              size={20}
              color="#6b7280"
            />
            <Text style={styles.address}>
              {t("create_order_page.additional_data.inputs.payment_type.label")}:{" "}
              {paymentTypeLabel}
            </Text>
          </View>
        )}

        {!!order?.main_phone_number && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.row}
            onPress={() => Linking.openURL(`tel:${order.main_phone_number}`)}
          >
            <Ionicons name="call-outline" size={20} color="#6b7280" />
            <Text style={styles.address}>{order.main_phone_number}</Text>
          </TouchableOpacity>
        )}

        {!!order?.comments && (
          <View style={styles.row}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#6b7280" />
            <Text style={styles.address}>
              {t("create_order_page.additional_data.inputs.comments.label")}:{" "}
              {order.comments}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("order_info_page.dishes_title")}</Text>

        {dishes.length === 0 ? (
          <Text style={styles.noDishes}>{t("order_info_page.no_dishes")}</Text>
        ) : (
          dishes.map((dish, index) => (
            <View key={dish.key} style={styles.dishRow}>
              <Text style={styles.dishName} numberOfLines={2}>
                {index + 1}. {dish.name}
              </Text>
              <Text style={styles.dishCount}>× {dish.count}</Text>
              <Text style={styles.dishPrice}>
                {(+dish.price).toFixed(2)} {currency}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {t("create_order_page.additional_data.items_price")}
          </Text>
          <Text style={styles.totalValue}>
            {itemsPrice.toFixed(2)} {currency}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {t("create_order_page.additional_data.delivery_price")}
          </Text>
          <Text style={styles.totalValue}>
            {deliveryPrice.toFixed(2)} {currency}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.grandLabel}>
            {t("create_order_page.additional_data.total_sum")}
          </Text>
          <Text style={styles.grandValue}>
            {totalSum.toFixed(2)} {currency}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <RateOrderButton
          orderStatus={order?.status}
          rating={order?.rating}
          orderID={order?.id}
          size="md"
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

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.support}
        onPress={() => navigator.navigate(Screens.Profile)}
      >
        <Text style={styles.supportText}>
          {t("order_info_page.all_changes_from_tech")}{" "}
          <Text style={[styles.supportText, styles.supportLink]}>
            {t("order_info_page.support")}
          </Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default OrderInfo;
