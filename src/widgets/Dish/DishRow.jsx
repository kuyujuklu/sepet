import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ENV } from "../../constants/env/env";
import { images } from "../../app/images/images";
import { formatPrice, getDishPrices } from "../../shared/utils/dish";
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
  const dispatch = useDispatch();

  const dishInBasket = useSelector(selectDishFromBasket(dish?.id));
  const count = +dishInBasket?.count || 0;

  const prices = getDishPrices(dish, pub);

  const imagePath = dish?.image_file_name
    ? ENV.API_HTTP_URL +
      ENV.API_STATIC_PATH +
      "/images/dishes/" +
      dish.image_file_name
    : null;

  const canOrder = isPubOpen !== false && isAvailableForDelivery !== false;

  const increase = () => {
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
        imagePath,
        dish,
        dishID: dish?.id,
        pubID,
        commission: prices.commission,
        isAvailableForDelivery,
        isPubOpen,
      }),
    );
  };

  return (
    <View style={styles.row}>
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
