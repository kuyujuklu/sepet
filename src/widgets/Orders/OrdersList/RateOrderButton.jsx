import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useRateOrderMutation } from "../../../shared/api/ordersApi/ordersApi";
import Star from "./Star";
import { orderStatuses } from "../../../app/static-data/data";
import {
  alertStatuses,
  pushAlert,
} from "../../../features/store/alerts/alertSlice";

// Same pill shape as the neighboring "Repeat" button at each call site
// (OrderCard.jsx's/OrderInfo.jsx's own `repeat` style), so the two sit at the
// same size instead of the rate button looking oversized and unstyled next
// to it. Amber, not green - reuses the exact tone already used for the
// not_handled/handled status badges instead of inventing a new color.
const sizes = {
  sm: { iconSize: 15, fontSize: 13, starSize: 15, paddingVertical: 8 },
  md: { iconSize: 16, fontSize: 14, starSize: 16, paddingVertical: 9 },
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#fef3c7",
  },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
});

const RateOrderButton = ({ orderStatus, orderID, rating, size = "md" }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [
    rateOrderRequest,
    { isLoading: isRateOrderLoading },
  ] = useRateOrderMutation();

  const [isRatingShown, setIsRatingShown] = useState(false);

  useEffect(() => {
    setIsRatingShown(!!rating);
  }, [rating]);

  const s = sizes[size] ?? sizes.md;

  const handleRateClick = () => {
    if (orderStatus !== orderStatuses.completed) {
      dispatch(
        pushAlert({
          status: alertStatuses.warning,
          delay: 2000,
          title: t("order_page.order_card.order_is_not_completed_alert"),
        }),
      );
      return;
    }

    if (!rating || rating === 0) {
      setIsRatingShown(true);
    }
  };

  const handleStarClick = (rating) => {
    rateOrderRequest({ orderID, rating });
  };

  const MAX_RATING = 5;

  if (!isRatingShown) {
    return (
      <TouchableOpacity onPress={handleRateClick}>
        <View style={[styles.pill, { paddingVertical: s.paddingVertical }]}>
          <Ionicons name="star" size={s.iconSize} color="#92400e" />
          <Text style={{ fontSize: s.fontSize, fontWeight: "bold", color: "#92400e" }}>
            {t("order_page.order_card.rate_button")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.pill, { paddingVertical: s.paddingVertical }]}>
      {isRateOrderLoading ? (
        <ActivityIndicator size="small" color="#92400e" />
      ) : (
        <View style={styles.starsRow}>
          {Array.from({ length: MAX_RATING }).map((_, i) => (
            <Pressable key={i} onPress={() => handleStarClick(i + 1)}>
              <Star empty={i >= (rating ?? 0)} size={s.starSize} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default RateOrderButton;
