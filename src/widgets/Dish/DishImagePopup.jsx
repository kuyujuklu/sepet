import { Button, Modal, Text, View } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import {
  closeClearBasketPopup,
  decreaseDish,
  doClearPopupConfirmingAction,
  increaseDish,
  selectDishFromBasket,
} from "../../features/store/basket/basketSlice";
import { useTranslation } from "react-i18next";
import {
  closeDishImagePopup,
  selectDishImagePopup,
} from "../../features/store/dishes/dishesSlice";
import { Image } from "expo-image";
import { TouchableOpacity } from "react-native";
import { memo } from "react";
import AnimatedNumber from "react-native-animated-numbers";
import { AnonymousProBold } from "../../constants/styles-constants";
import { images } from "../../app/images/images";

const addCommissionToPrice = (price, commission) => {
  return price + (price / 100) * commission;
};

const DishImagePopup = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const popupState = useSelector(selectDishImagePopup);
  const dishInBasket = useSelector(selectDishFromBasket(popupState?.dishID));
  const dishCount = (dishInBasket && +dishInBasket.count) ?? 0;

  const dish = popupState?.dish;
  const smallestPrice =
    dish?.sale_price && dish?.sale_price < dish?.price
      ? dish?.sale_price
      : dish?.price;

  return (
    <Modal isOpen={popupState.isOpened} animationPreset="fade">
      <Modal.Content style={{ width: "100%" }}>
        <Modal.Header>
          <Text fontSize="2xl" fontWeight="bold">
            {popupState?.dish?.name}
          </Text>
          <Text fontSize="sm" fontWeight="medium" color="coolGray.600">
            {popupState?.dish?.ingredients}
          </Text>
        </Modal.Header>
        <Modal.CloseButton onPress={() => dispatch(closeDishImagePopup())} />
        <Modal.Body>
          <View
            rounded="2xl"
            style={{
              overflow: "hidden",
              borderRadius: 26,
              alignItems: "center",
              justifyContent: "center",
              maxHeight: 300,
              width: "100%",
            }}
          >
            <Image
              alt="adsf"
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
              source={
                !!popupState.imagePath
                  ? { uri: popupState.imagePath }
                  : require("../../../assets/images/photo-black.png")
              }
            />
          </View>
          <View flex={1} justifyContent="space-between" mt="5" gap={5}>
            <View
              flex={1}
              flexDir="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {/* Prices */}
              <View flexDir={"row"} gap={4}>
                {/* Striked Higher price */}
                {
                  //if there is sale, show real price with line-through
                  !!dish?.sale_price && dish?.sale_price < dish?.price && (
                    <Text
                      fontSize={"md"}
                      color={"red.500"}
                      fontWeight="bold"
                      style={{
                        textDecorationLine: "line-through",
                        textDecorationStyle: "solid",
                      }}
                    >
                      {addCommissionToPrice(
                        dish?.price,
                        popupState?.commission,
                      )}{" "}
                      Lei
                    </Text>
                  )
                }
                {/* Lower price */}
                <Text
                  fontSize={"md"}
                  color="coolGray.700"
                  fontWeight={"medium"}
                >
                  {addCommissionToPrice(smallestPrice, popupState?.commission)}{" "}
                  Lei
                </Text>
              </View>
              {/* Add and remove buttons */}
              <View flexDir={"row"} alignItems={"center"} gap="3">
                {/* show count and decrease button if count > 0 */}
                {dishInBasket?.count > 0 && (
                  <>
                    {/* decrease button */}
                    <TouchableOpacity
                      onPress={() =>
                        dispatch(decreaseDish({ id: popupState?.dishID }))
                      }
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
                  onPress={() =>
                    dispatch(
                      increaseDish({
                        id: popupState?.dishID,
                        pubID: popupState?.pubID,
                        price: smallestPrice,
                      }),
                    )
                  }
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
            <Button
              background="red.600"
              minW={120}
              onPress={() => {
                dispatch(closeDishImagePopup());
              }}
            >
              {t("dish_popup.back")}
            </Button>
          </View>
        </Modal.Body>
      </Modal.Content>
    </Modal>
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

export default DishImagePopup;
