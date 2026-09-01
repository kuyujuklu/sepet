import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { images } from "../../app/images/images";
import {
  formatPrice,
  getDishImagePath,
  getDishPrices,
  isDishAvailable,
} from "../../shared/utils/dish";
import {
  decreaseDish,
  increaseDish,
  selectDishFromBasket,
} from "../../features/store/basket/basketSlice";
import { openDishImagePopup } from "../../features/store/dishes/dishesSlice";
import { openPubNotAvailableForDeliveryPopup } from "../../features/store/pubs/pubsSlice";
import { events, track } from "../../shared/analytics/analytics";
import QuantityStepper from "../Common/QuantityStepper";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
  },
  // Greyed out rather than hidden: a client looking for a dish they ordered
  // last week should see that it exists and is out today, not that it is gone
  rowSoldOut: { opacity: 0.55 },
  soldOut: { fontSize: 12, color: "#b45309", fontWeight: "bold", marginTop: 2 },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f1f1f3",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  placeholder: { width: 28, height: 28, opacity: 0.4 },
  body: { flex: 1, justifyContent: "space-between" },
  name: { fontSize: 15, fontWeight: "bold", color: "#111" },
  ingredients: { fontSize: 12, color: "#6b7280", marginTop: 2, lineHeight: 16 },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  prices: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  price: { fontSize: 16, fontWeight: "bold", color: "#111" },
  oldPrice: {
    fontSize: 12,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
});

// Compact dish row used by the "whole menu on one screen" view. The grid card
// (TopDishCard) is for the feed; a long menu reads much better as rows.
const DishRow = ({ dish, pub, pubID, isPubOpen, isAvailableForDelivery }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const dishInBasket = useSelector(selectDishFromBasket(dish?.id));
  const count = +dishInBasket?.count || 0;

  const prices = getDishPrices(dish, pub);

  // A 76px thumbnail; the full-size photo is only worth downloading for the
  // popup that shows it at 220px
  const imagePath = getDishImagePath(dish);

  const isAvailable = isDishAvailable(dish);
  const canOrder =
    isAvailable && isPubOpen !== false && isAvailableForDelivery !== false;

  const increase = () => {
    if (!isAvailable) return;

    if (!canOrder) {
      dispatch(openPubNotAvailableForDeliveryPopup());
      return;
    }

    dispatch(
      increaseDish({ id: dish?.id, pubID, price: prices.basketPrice }),
    );
  };

  const openDetails = () => {
    track(events.dishOpened, { dish_id: dish?.id, pub_id: pubID });

    dispatch(
      openDishImagePopup({
        imagePath: getDishImagePath(dish, { full: true }) ?? imagePath,
        dish,
        dishID: dish?.id,
        pubID,
        commission: prices.commission,
        isAvailableForDelivery,
        isPubOpen,
        isDishAvailable: isAvailable,
      }),
    );
  };

  return (
    <View style={[styles.row, !isAvailable && styles.rowSoldOut]}>
      <TouchableOpacity activeOpacity={0.85} onPress={openDetails}>
        <View style={styles.thumb}>
          {imagePath ? (
            <Image
              source={{ uri: imagePath }}
              style={styles.image}
              contentFit="cover"
              recyclingKey={String(dish?.id)}
              cachePolicy="memory-disk"
              transition={120}
              alt=""
            />
          ) : (
            <Image
              source={images.KnifeInPlateBlack}
              style={styles.placeholder}
              contentFit="contain"
              alt=""
            />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.body}>
        <TouchableOpacity activeOpacity={0.85} onPress={openDetails}>
          <Text style={styles.name} numberOfLines={2}>
            {dish?.name}
          </Text>
          {!isAvailable && (
            <Text style={styles.soldOut}>
              {t("home_page.top_dishes.sold_out")}
            </Text>
          )}
          {!!dish?.ingredients && (
            <Text style={styles.ingredients} numberOfLines={2}>
              {dish.ingredients}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottom}>
          <View style={styles.prices}>
            <Text style={styles.price}>
              {formatPrice(prices.price)} {prices.currency}
            </Text>
            {!!prices.oldPrice && (
              <Text style={styles.oldPrice}>{formatPrice(prices.oldPrice)}</Text>
            )}
          </View>

          <QuantityStepper
            count={count}
            canOrder={canOrder}
            onIncrease={increase}
            onDecrease={() => dispatch(decreaseDish({ id: dish?.id }))}
          />
        </View>
      </View>
    </View>
  );
};

export default memo(DishRow);
