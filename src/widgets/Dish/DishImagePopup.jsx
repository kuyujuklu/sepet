import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { useToast } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import BottomSheet from "../Common/BottomSheet";
import QuantityStepper from "../Common/QuantityStepper";
import {
  decreaseDish,
  increaseDish,
  selectDishFromBasket,
} from "../../features/store/basket/basketSlice";
import {
  closeDishImagePopup,
  selectDishImagePopup,
} from "../../features/store/dishes/dishesSlice";
import { openPubNotAvailableForDeliveryPopup } from "../../features/store/pubs/pubsSlice";
import {
  addCommissionToPrice,
  formatPrice,
  isDishAvailable,
} from "../../shared/utils/dish";
import { images } from "../../app/images/images";

const styles = StyleSheet.create({
  imageBox: {
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f1f1f3",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  placeholder: { width: 56, height: 56, opacity: 0.35 },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 16,
  },
  prices: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  price: { fontSize: 24, fontWeight: "bold", color: "#111" },
  oldPrice: {
    fontSize: 15,
    color: "#9ca3af",
    textDecorationLine: "line-through",
    marginBottom: 3,
  },
  inBasket: { marginTop: 12, fontSize: 13, color: "#059669", fontWeight: "bold" },
  soldOut: { marginTop: 12, fontSize: 13, color: "#b45309", fontWeight: "bold" },
});

const DishImagePopup = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const toast = useToast();

  const popupState = useSelector(selectDishImagePopup);
  const dish = popupState?.dish;

  const dishInBasket = useSelector(selectDishFromBasket(popupState?.dishID));
  const dishCount = +dishInBasket?.count || 0;

  const commission = popupState?.commission ?? 0;
  const isOnSale = !!dish?.sale_price && +dish.sale_price < +dish.price;
  const priceToPay = isOnSale ? +dish.sale_price : +dish?.price;

  // The opener may know the dish is on the stop list (the feed does); when it
  // does not, the dish object itself still carries `available`
  const isAvailable =
    popupState?.isDishAvailable !== false && isDishAvailable(dish);

  // Closed-for-now no longer disables the button - only the stop list and
  // being outside the delivery zone are real blocks
  const canOrder =
    isAvailable && popupState?.isAvailableForDelivery !== false;

  const handleIncreaseDish = () => {
    if (!isAvailable) return;

    // Outside the delivery zone is a real block - changing hours won't fix it
    if (popupState?.isAvailableForDelivery === false) {
      dispatch(openPubNotAvailableForDeliveryPopup());
      return;
    }

    // Just closed for now: let the basket be built anyway, only nudge with a toast
    if (popupState?.isPubOpen === false) {
      toast.show({
        title: t("pub_not_available_for_delivery.closed_toast"),
        placement: "top",
      });
    }

    dispatch(
      increaseDish({
        id: dish?.id,
        pubID: popupState?.pubID ?? 0,
        price: priceToPay,
      }),
    );
  };

  return (
    <BottomSheet
      id="dishImage"
      isOpened={popupState.isOpened}
      onClose={() => dispatch(closeDishImagePopup())}
      title={dish?.name}
      subtitle={dish?.ingredients}
      scrollable
    >
      <View style={styles.imageBox}>
        {popupState?.imagePath ? (
          <Image
            source={{ uri: popupState.imagePath }}
            style={styles.image}
            contentFit="cover"
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

      <View style={styles.bottom}>
        <View style={styles.prices}>
          <Text style={styles.price}>
            {formatPrice(addCommissionToPrice(priceToPay, commission))} Lei
          </Text>
          {isOnSale && (
            <Text style={styles.oldPrice}>
              {formatPrice(addCommissionToPrice(+dish.price, commission))} Lei
            </Text>
          )}
        </View>

        <QuantityStepper
          size="lg"
          count={dishCount}
          canOrder={canOrder}
          onIncrease={handleIncreaseDish}
          onDecrease={() => dispatch(decreaseDish({ id: popupState?.dishID }))}
        />
      </View>

      {!isAvailable && (
        <Text style={styles.soldOut}>{t("dish_popup.sold_out")}</Text>
      )}

      {dishCount > 0 && (
        <Text style={styles.inBasket}>
          {t("dish_popup.in_basket", { value: dishCount })}
        </Text>
      )}
    </BottomSheet>
  );
};

export default DishImagePopup;
