import { Text, View } from "native-base";
import { AnonymousProBold } from "../../constants/styles-constants";
import { TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import {
  decreaseDish,
  increaseDish,
  selectDishFromBasket,
} from "../../features/store/basket/basketSlice";
import AnimatedNumber from "react-native-animated-numbers";
import { memo, useEffect, useState } from "react";
import { ENV } from "../../constants/env/env";
import { currencies } from "../../app/static-data/data";

const DishCard = ({ dish, pubID, pub }) => {
  const dispatch = useDispatch();
  const imagePath =
    ENV.API_HTTP_URL +
    ENV.API_STATIC_PATH +
    "/images/dishes/" +
    dish?.image_file_name;

  const dishInBasket = useSelector(selectDishFromBasket(dish?.id));

  const currency =
    currencies.find((currency) => currency.id === pub?.currency_id)?.symbol ??
    "Lei";

  const smallestPrice =
    dish?.sale_price && dish?.sale_price < dish?.price
      ? dish?.sale_price
      : dish?.price;

  const dishCount = (dishInBasket && +dishInBasket.count) || 0;

  return (
    <View maxWidth={400} style={{ width: "100%", alignSelf: "center" }}>
      {/* Image container */}
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
          w="120%"
          h="120%"
          backgroundColor={"rgba(0, 0, 0, 0.5)"}
          borderWidth={2}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Text fontSize={"2xl"} fontWeight={"bold"} color={"#fff"}>
            {dish?.name}
          </Text>
        </View>
      </View>

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

        <View
          flexDir="row"
          alignItems="center"
          justifyContent="flex-end"
          w="full"
          gap={4}
        >
          {/* Prices */}
          <View flexDir={"row"} gap={4}>
            {/* Striked Higher price */}
            {
              //if there is sale, show real price with line-through
              !!dish?.sale_price && (
                <Text
                  fontSize={"md"}
                  color={"red.500"}
                  fontWeight="bold"
                  style={{
                    textDecorationLine: "line-through",
                    textDecorationStyle: "solid",
                  }}
                >
                  {dish?.price} {currency}
                </Text>
              )
            }
            {/* Lower price */}
            <Text fontSize={"md"} color="coolGray.700" fontWeight={"medium"}>
              {smallestPrice} {currency}
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
                      width: 23,
                      height: 23,
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
              onPress={() =>
                dispatch(
                  increaseDish({
                    id: dish?.id,
                    pubID: pubID,
                    price: smallestPrice,
                  }),
                )
              }
            >
              <Image
                style={{
                  width: 23,
                  height: 23,
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
