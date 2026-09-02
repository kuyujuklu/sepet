import { Text, useToast, View } from "native-base";
import { Image } from "expo-image";
import { memo, useState } from "react";
import { TouchableOpacity } from "react-native";
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
import { events, track } from "../../shared/analytics/analytics";
import QuantityStepper from "../Common/QuantityStepper";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
};

const TopDishCard = ({ item, width }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const toast = useToast();

  const dish = item?.dish;
  const pub = item?.pub;

  const dishInBasket = useSelector(selectDishFromBasket(dish?.id));
  const dishCount = +dishInBasket?.count || 0;

  const prices = getDishPrices(dish, pub);
  // The 130px grid used to download the full-size photo of every card
  const imagePath = getDishImagePath(dish);
  const isPubOpen = pub?.isOpen !== false;
  // The badge is a field now, not "one of the first two cards of the feed"
  const isHit = !!dish?.is_hit;
  const isAvailable = isDishAvailable(dish);
  // Closed-for-now no longer disables the button - the feed is already
  // filtered to deliverable pubs, so the stop list is the only real block
  const canOrder = isAvailable;

  const [imageLoaded, setImageLoaded] = useState(!imagePath);

  const distanceInKm = +pub?.distance / 1000;

  const handleIncreaseDish = () => {
    if (!isAvailable) return;

    // Just closed for now: let the basket be built anyway, only nudge with a toast
    if (!isPubOpen) {
      toast.show({
        title: t("pub_not_available_for_delivery.closed_toast"),
        placement: "top",
      });
    }

    dispatch(
      increaseDish({
        id: dish?.id,
        pubID: pub?.id,
        price: prices.basketPrice,
      }),
    );
  };

  const openDishDetails = () => {
    track(events.dishOpened, { dish_id: dish?.id, pub_id: pub?.id });

    dispatch(
      openDishImagePopup({
        // The popup shows the photo full-bleed, so it wants the original
        imagePath: getDishImagePath(dish, { full: true }) ?? imagePath,
        dish,
        dishID: dish?.id,
        pubID: pub?.id,
        commission: prices.commission,
        // The feed is built from the pubs that deliver to the client
        isAvailableForDelivery: true,
        isPubOpen,
        isDishAvailable: isAvailable,
      }),
    );
  };

  return (
    <View style={{ width }}>
      <View backgroundColor="#fff" borderRadius={24} style={cardShadow}>
        {/* Image */}
        <TouchableOpacity activeOpacity={0.9} onPress={openDishDetails}>
          <View
            height={130}
            borderTopRadius={24}
            overflow="hidden"
            backgroundColor="#1b1b1b"
            alignItems="center"
            justifyContent="center"
          >
            {imagePath ? (
              <Image
                onLoad={() => setImageLoaded(true)}
                contentFit="cover"
                style={{ width: "100%", height: "100%" }}
                source={{ uri: imagePath }}
                // Lets the list reuse the view instead of decoding the photo
                // again every time the feed is rebuilt
                recyclingKey={String(dish?.id)}
                cachePolicy="memory-disk"
                transition={120}
                alt=""
              />
            ) : (
              <Image
                contentFit="contain"
                style={{ width: 44, height: 44, opacity: 0.6 }}
                source={images.KnifeInPlateBlack}
                alt=""
              />
            )}

            {!imageLoaded && (
              <View position="absolute" w="full" h="full" backgroundColor="#1b1b1b" />
            )}

            {/* Discount */}
            {prices.discountPercent > 0 && (
              <View
                position="absolute"
                top={2}
                left={2}
                px="2"
                py="0.5"
                borderRadius="xl"
                backgroundColor="red.500"
              >
                <Text color="#fff" fontSize={12} fontWeight="bold">
                  -{prices.discountPercent}%
                </Text>
              </View>
            )}

            {/* Best seller */}
            {isHit && prices.discountPercent <= 0 && (
              <View
                position="absolute"
                top={2}
                left={2}
                px="2"
                py="0.5"
                borderRadius="xl"
                backgroundColor="rgba(0, 0, 0, 0.6)"
              >
                <Text color="#fff" fontSize={12} fontWeight="bold">
                  {t("home_page.top_dishes.hit_badge")}
                </Text>
              </View>
            )}

            {/* Sold out beats closed: the pub may well be open, the dish
                just is not there today (the stop list) */}
            {(!isAvailable || !isPubOpen) && (
              <View
                position="absolute"
                w="full"
                h="full"
                backgroundColor="rgba(0, 0, 0, 0.55)"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="#fff" fontSize={14} fontWeight="medium">
                  {t(
                    !isAvailable
                      ? "home_page.top_dishes.sold_out"
                      : "home_page.top_dishes.closed",
                  )}
                </Text>
              </View>
            )}

            {/* Quick add */}
            <View position="absolute" bottom={2} right={2}>
              <QuantityStepper
                count={dishCount}
                canOrder={canOrder}
                onIncrease={handleIncreaseDish}
                onDecrease={() => dispatch(decreaseDish({ id: dish?.id }))}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Info */}
        <TouchableOpacity activeOpacity={0.9} onPress={openDishDetails}>
          <View px="3" pt="2" pb="3" gap={1}>
            <Text
              fontSize={15}
              fontWeight="bold"
              color="#111"
              numberOfLines={2}
              style={{ minHeight: 38 }}
            >
              {dish?.name}
            </Text>

            <View flexDir="row" alignItems="center" gap={1}>
              <Text
                flex={1}
                fontSize={12}
                color="coolGray.500"
                numberOfLines={1}
              >
                {pub?.name}
              </Text>

              {!isNaN(distanceInKm) && (
                <>
                  <View style={{ width: 11, height: 11, opacity: 0.5 }}>
                    <Image
                      source={images.Locaiton}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                  <Text fontSize={12} color="coolGray.500">
                    {distanceInKm.toFixed(1)} km
                  </Text>
                </>
              )}
            </View>

            <View flexDir="row" alignItems="flex-end" gap={2} mt={1}>
              <Text fontSize={17} fontWeight="bold" color="#111">
                {formatPrice(prices.price)} {prices.currency}
              </Text>

              {!!prices.oldPrice && (
                <Text
                  fontSize={13}
                  color="coolGray.400"
                  style={{
                    textDecorationLine: "line-through",
                    textDecorationStyle: "solid",
                  }}
                >
                  {formatPrice(prices.oldPrice)}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(TopDishCard);
