import { Button, Image, ScrollView, Spinner, Text, View } from "native-base";
import { useEffect, useMemo, useState } from "react";
import CreateOrderInputs from "./CreateOrderInputs/CreateOrderInputs";
import Radio from "../../Inputs/Radio";
import {
  AnonymousProBold,
  AnonymousProRegular,
} from "../../../constants/styles-constants";
import { validateOrder } from "../../../shared/validation/validators/order/order-validator";
import { useCreateOrderMutation } from "../../../shared/api/ordersApi/ordersApi";
import { useDispatch } from "react-redux";
import {
  errorKeys,
  pushError,
} from "../../../features/store/errorHandling/errorHandlingSlice";
import {
  alertStatuses,
  pushAlert,
} from "../../../features/store/alerts/alertSlice";
import { useNavigation } from "@react-navigation/native";
import { orderPaymentTypes } from "../../../app/static-data/data";
import { useTranslation } from "react-i18next";
import { clearBasket } from "../../../features/store/basket/basketSlice";
import { addOrder } from "../../../features/store/orders/ordersSlice";
import { images } from "../../../app/images/images";
const CreateOrder = ({
  pubID,
  shippingTimeFrom,
  shippingTimeTo,
  itemsPrice,
  deliveryPrice,
  basket,
}) => {
  const { t } = useTranslation();
  const navigator = useNavigation();
  const dispatch = useDispatch();
  const [town, setTown] = useState();
  const [fullAddress, setFullAddress] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [secondPhoneNumber, setSecondPhoneNumber] = useState("");
  const [comments, setComments] = useState("");
  const [paymentType, setPaymentType] = useState("cash");

  const totalSum = (itemsPrice ?? 0) + (deliveryPrice ?? 0);

  const isShippingTimeAvailable = !!(shippingTimeFrom && shippingTimeTo);

  const [triedToSubmit, setTriedToSubmit] = useState(false);

  const areInputsValid = useMemo(() => {
    const errors = validateOrder(
      town,
      fullAddress,
      phoneNumber,
      secondPhoneNumber,
    );
    return errors.length === 0;
  }, [town, fullAddress, phoneNumber, secondPhoneNumber]);

  const [
    createOrder,
    {
      data: createOrderResponse,
      error: createOrderError,
      isLoading: isCreateOrderLoading,
    },
  ] = useCreateOrderMutation();

  useEffect(() => {
    if (!createOrderError) return;
    dispatch(
      pushError({
        errorKey: errorKeys.createOrderError,
        error: createOrderError,
      }),
    );
  }, [createOrderError]);

  const sendData = () => {
    setTriedToSubmit(true);

    if (!areInputsValid) {
      dispatch(
        pushAlert({
          status: alertStatuses.error,
          delay: 2000,
          title: "fill all required inputs",
        }),
      );
      return;
    }

    if (!basket) {
      dispatch(
        pushAlert({
          status: alertStatuses.error,
          delay: 2000,
          title: "you have no dishes in basket",
        }),
      );
    }

    const dishIDs = Object.keys(basket);

    if (dishIDs.length === 0) {
      dispatch(
        pushAlert({
          status: alertStatuses.error,
          delay: 2000,
          title: "you have no dishes in basket",
        }),
      );
    }

    const dishes = dishIDs.map((dishID) => ({
      dishID,
      count: basket[dishID].count,
    }));

    const order = {
      town,
      fullAddress,
      mainPhoneNumber: phoneNumber,
      secondPhoneNumber,
      comments,
      paymentType,
      pubID,
      dishes,
    };

    createOrder({ order });
  };

  useEffect(() => {
    if (!createOrderResponse || !createOrderResponse.ok) return;

    dispatch(addOrder(createOrderResponse.order));
    dispatch(clearBasket());
    navigator.navigate("Orders");

  }, [createOrderResponse]);

  return (
    <ScrollView>
      <View justifyContent={"center"} flex={1}>
        <Text
          fontSize={15}
          textTransform={"uppercase"}
          fontWeight={"bold"}
          textAlign={"center"}
          mb={2}
        >
          {t("create_order_page.additional_data.headline")}
        </Text>

        <View px={10} gap="4" flex={1} overflow={"hidden"}>
          <CreateOrderInputs
            town={town}
            setTown={setTown}
            fullAddress={fullAddress}
            setFullAddress={setFullAddress}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            secondPhoneNumber={secondPhoneNumber}
            setSecondPhoneNumber={setSecondPhoneNumber}
            comments={comments}
            setComments={setComments}
            validatedOutside={triedToSubmit}
          />

          <Text
            mt={2}
            fontSize={15}
            textTransform={"uppercase"}
            fontWeight={"bold"}
            textAlign={"center"}
          >
            {t("create_order_page.additional_data.inputs.payment_type.label")}
          </Text>

          <View justifyContent={"center"} flexDir={"row"} w={"full"}>
            <View maxW={"300"} w={"full"}>
              <Radio
                value={paymentType}
                setValue={setPaymentType}
                values={[
                  {
                    value: orderPaymentTypes.cash,
                    text: t(
                      "create_order_page.additional_data.inputs.payment_type.values.cash",
                    ),
                  },
                  {
                    value: orderPaymentTypes.cardOffline,
                    text: t(
                      "create_order_page.additional_data.inputs.payment_type.values.card_offline",
                    ),
                  },
                ]}
              />
            </View>
          </View>

          {isShippingTimeAvailable && (
            <View
              alignItems={"center"}
              flexDirection={"row"}
              justifyContent={"center"}
              gap="2"
            >
              <Text fontSize={20} fontWeight={"medium"}>
                {t("create_order_page.additional_data.delivery_time")}
              </Text>
              <View style={{ width: 25, height: 25 }}>
                <Image
                  source={images.ClockBlack}
                  style={{ width: "100%", height: "100%" }}
                  alt=""
                />
              </View>
              <Text fontWeight={"medium"} fontSize={20}>
                {shippingTimeFrom} - {shippingTimeTo}
              </Text>
            </View>
          )}

          <View gap="2" mb="4">
            <Text
              color="gray.600"
              fontFamily={AnonymousProRegular}
              fontSize={15}
            >
              {t("create_order_page.additional_data.items_price")}: {itemsPrice}
            </Text>
            <Text
              color="gray.600"
              fontFamily={AnonymousProRegular}
              fontSize={15}
            >
              {t("create_order_page.additional_data.delivery_price")}:{" "}
              {deliveryPrice}
            </Text>
            <Text color="gray.600" fontFamily={AnonymousProBold} fontSize={18}>
              {t("create_order_page.additional_data.total_sum")}: {totalSum}
            </Text>
          </View>
        </View>

        <View pb={5} px={2}>
          <Button
            disabled={!areInputsValid}
            background={areInputsValid ? "emerald.600" : "coolGray.400"}
            borderRadius={15}
            onPress={sendData}
          >
            {isCreateOrderLoading ? (
              <Spinner />
            ) : (
              <Text color={"white"}>
                {t("create_order_page.additional_data.create_order_button")}
              </Text>
            )}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateOrder;
