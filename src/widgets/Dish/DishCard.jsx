import { Pressable, Spinner, Text, View } from "native-base";
import { AnonymousProBold } from "../../constants/styles-constants";
import { TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import {
  decreaseDish,
  increaseDish,
  selectDishFromBasket,
} from "../../features/store/basket/basketSlice";
import AnimatedNumber from "react-native-animated-numbers";
import { memo, useEffect, useState } from "react";
import {
  formatPrice,
  getDishImagePath,
  getDishPrices,
  isDishAvailable,
} from "../../shared/utils/dish";
import { openDishImagePopup } from "../../features/store/dishes/dishesSlice";
import { openPubNotAvailableForDeliveryPopup } from "../../features/store/pubs/pubsSlice";
import { alertStatuses, pushAlert } from "../../features/store/alerts/alertSlice";

const DishCard = ({ dish, pubID, pub, isPubOpen, isAvailableForDelivery }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const imagePath = getDishImagePath(dish, { full: true });

  const dishInBasket = useSelector(selectDishFromBasket(dish?.id));

  const prices = getDishPrices(dish, pub);

  const dishCount = (dishInBasket && +dishInBasket.count) ?? 0;

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (dish && !dish.image_file_name) {
      setImageLoaded(true);
    }
  }, [dish]);

  const isAvailable = isDishAvailable(dish);

  const handleIncreaseDish = () => {
    // The stop list: the pub is open and delivers, this one dish is simply
    // not there today
    if (!isAvailable) return;

    // Outside the delivery zone is a real block - changing hours won't fix it
    if (!isAvailableForDelivery) {
      dispatch(openPubNotAvailableForDeliveryPopup())
      return;
    };

    // Just closed for now: let the basket be built anyway, only nudge with a toast
    if (!isPubOpen) {
      dispatch(
        pushAlert({
          status: alertStatuses.info,
          delay: 4000,
          title: t("pub_not_available_for_delivery.closed_toast"),
        }),
      );
    }

    dispatch(
      increaseDish({
        id: dish?.id,
        pubID: pubID,
        price: prices.basketPrice,
      }),
    )
  }

  return (
    <View
      maxWidth={400}
      style={{ width: "100%", alignSelf: "center", opacity: isAvailable ? 1 : 0.55 }}
    >
      {/* Image container */}
      <Pressable
        onPress={() =>
          dispatch(
            openDishImagePopup({
              imagePath,
              dish: dish,
              dishID: dish?.id,
              pubID: pubID,
              commission: prices.commission,
              isAvailableForDelivery,
              isPubOpen,
              isDishAvailable: isAvailable,
            }),
          )
        }
      >
        <View
          style={{
            height: 160,
            overflow: "hidden",
            borderRadius: 26,
            //   borderBottomWidth: 12,
            //   borderTopWidth: 4,
            //   borderRightWidth: 2,
            //   borderLeftWidth: 2,
            borderColor: "#333",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {dish.image_file_name ? (
            <Image
              onLoad={() => setImageLoaded(true)}
              alt=""
              resizeMode="contain"
              style={{ width: "100%", aspectRatio: 1 / 8 }}
              source={{ uri: imagePath }}
            />
          ) : (
            <></>
          )}
          <View
            position={"absolute"}
            w="100%"
            h="100%"
            backgroundColor={"rgba(0, 0, 0, 0.5)"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <Text px={2} w="full" textAlign="center" numberOfLines={1} fontSize={"2xl"} fontWeight={"bold"} color={"#fff"}>
              {dish?.name}
            </Text>

            {!imageLoaded && <Spinner color="white" w="25" h="25" />}
          </View>
        </View>
      </Pressable>

      {/* Info container */}
      <View
        style={{
          paddingTop: 3,
          paddingRight: 20,
          paddingLeft: 20,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {!!dish?.ingredients && (
          <Text
            fontSize={"sm"}
            textAlign={"right"}
            w="full"
            color={"coolGray.600"}
            fontWeight={"medium"}
            fontFamily={AnonymousProBold}
          >
            {dish?.ingredients}
          </Text>
        )}

        <View
          flexDir="row"
          alignItems="center"
          justifyContent="flex-end"
          w="full"
          gap={4}
        >
          {/* Prices */}
          <View flexDir={"row"} gap={4}>
            {!!prices.oldPrice && (
              <Text
                fontSize={"md"}
                color={"red.500"}
                fontWeight="bold"
                style={{
                  textDecorationLine: "line-through",
                  textDecorationStyle: "solid",
                }}
              >
                {formatPrice(prices.oldPrice)} {prices.currency}
              </Text>
            )}
            <Text fontSize={"md"} color="coolGray.700" fontWeight={"medium"}>
              {formatPrice(prices.price)} {prices.currency}
            </Text>
          </View>

          {/* Add and remove buttons */}
          <View flexDir={"row"} alignItems={"center"} gap="3">
            {/* show count and decrease button if count > 0 */}
            {dishInBasket?.count > 0 && (
              <>
                {/* decrease button */}
                <TouchableOpacity
                  onPress={() => dispatch(decreaseDish({ id: dish?.id }))}
                >
                  <Image
                    style={{
                      width: 30,
                      height: 30,
                    }}
                    alt=""
                    source={require("../../../assets/images/minus-in-circle-black.png")}
                  />
                </TouchableOpacity>
              </>
            )}
            {/* COUNTER */}
            <View opacity={dishInBasket?.count > 0 ? 1 : 0}>
              <Number number={dishCount} />
            </View>

            {/* increase button */}
            <TouchableOpacity
              disabled={!isAvailable}
              onPress={handleIncreaseDish}
            >
              <Image
                style={{
                  width: 30,
                  height: 30,
                }}
                alt=""
                source={require("../../../assets/images/plus-in-circle-black.png")}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const Number = memo(function Number({ number }) {
  return (
    <AnimatedNumber
      includeComma
      animateToNumber={number}
      animationDuration={500}
      fontStyle={{ fontSize: 20, fontFamily: AnonymousProBold }}
    />
  );
});

export default DishCard;
