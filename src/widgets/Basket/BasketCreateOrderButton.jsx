import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  selectBasket,
  selectBasketPubID,
} from "../../features/store/basket/basketSlice";
import { useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";
import {
  alertStatuses,
  pushAlert,
} from "../../features/store/alerts/alertSlice";
import { formatPrice } from "../../shared/utils/dish";
import { events, track } from "../../shared/analytics/analytics";

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#059669",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  disabled: { backgroundColor: "#a1a1aa" },
  label: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  total: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

const BasketCreateOrderButton = ({
  itemsPrice,
  deliveryPrice,
  currency,
  isPubOpen,
  isAvailableForDelivery,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigator = useNavigation();

  const basket = useSelector(selectBasket);
  const pubID = useSelector(selectBasketPubID);

  const basketIsEmpty = !basket || Object.keys(basket).length === 0;

  const { data: pubData, isLoading } = useGetPubInfoQuery(
    { pubID },
    { skip: !pubID },
  );

  const isDisabled = basketIsEmpty || !pubData?.pub;
  const total = (itemsPrice ?? 0) + (deliveryPrice ?? 0);

  const handleButtonPress = () => {
    if (isDisabled) return;

    if (!isPubOpen || !isAvailableForDelivery) {
      dispatch(
        pushAlert({
          status: alertStatuses.warning,
          delay: 2500,
          title: t("basket_page.pub_is_closed_error"),
        }),
      );
      return;
    }

    track(events.checkoutOpened, { pub_id: pubID });

    navigator.navigate("CreateOrder", {
      itemsPrice,
      deliveryPrice,
      pubID,
      shippingTimeFrom: pubData?.pub?.shipping?.shipping_time_from,
      shippingTimeTo: pubData?.pub?.shipping?.shipping_time_to,
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      onPress={handleButtonPress}
    >
      <View style={[styles.button, isDisabled && styles.disabled]}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.label}>
              {t("basket_page.create_order_button")}
            </Text>
            <Text style={styles.total}>
              {formatPrice(total)} {currency}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default BasketCreateOrderButton;
