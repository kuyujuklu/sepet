import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { ENV } from "../../constants/env/env";
import { images } from "../../app/images/images";
import { formatPrice, getDishPrices } from "../../shared/utils/dish";
import { getBasketItemPrice } from "../../shared/utils/basket";
import {
  decreaseDish,
  increaseDish,
  openRemoveDishPopup,
} from "../../features/store/basket/basketSlice";
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
    width: 74,
    height: 74,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f1f1f3",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  placeholder: { width: 26, height: 26, opacity: 0.4 },
  body: { flex: 1, justifyContent: "space-between" },
  name: { fontSize: 15, fontWeight: "bold", color: "#111" },
  unitPrice: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  linePrice: { fontSize: 16, fontWeight: "bold", color: "#111" },
  oldLinePrice: {
    fontSize: 12,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
});

// One position of the basket. The minus at count === 1 does not delete the
// line silently any more - it asks first (openRemoveDishPopup).
const BasketItemRow = ({ dish, item, pub, pubID }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const count = +item?.count || 0;
  const prices = getDishPrices(dish, pub);
  const linePrice = getBasketItemPrice(item, pub);

  const imagePath = dish?.image_file_name
    ? ENV.API_HTTP_URL +
      ENV.API_STATIC_PATH +
      "/images/dishes/" +
      dish.image_file_name
    : null;

  const decrease = () => {
    if (count <= 1) {
      dispatch(openRemoveDishPopup({ dishID: dish?.id, dishName: dish?.name }));
      return;
    }

    dispatch(decreaseDish({ id: dish?.id }));
  };

  const increase = () =>
    dispatch(
      increaseDish({ id: dish?.id, pubID, price: prices.basketPrice }),
    );

  return (
    <View style={styles.row}>
      <View style={styles.thumb}>
        {imagePath ? (
          <Image
            source={{ uri: imagePath }}
            style={styles.image}
            contentFit="cover"
            recyclingKey={String(dish?.id)}
            cachePolicy="memory-disk"
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

      <View style={styles.body}>
        <View>
          <Text style={styles.name} numberOfLines={2}>
            {dish?.name}
          </Text>
          <Text style={styles.unitPrice}>
            {formatPrice(prices.price)} {prices.currency} ·{" "}
            {t("basket_page.per_item")}
          </Text>
        </View>

        <View style={styles.bottom}>
          <QuantityStepper
            tone="light"
            count={count}
            onIncrease={increase}
            onDecrease={decrease}
          />

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.linePrice}>
              {formatPrice(linePrice)} {prices.currency}
            </Text>
            {!!prices.oldPrice && (
              <Text style={styles.oldLinePrice}>
                {formatPrice(prices.oldPrice * count)} {prices.currency}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(BasketItemRow);
