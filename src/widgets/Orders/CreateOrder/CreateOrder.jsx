import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CreateOrderInputs from "./CreateOrderInputs/CreateOrderInputs";
import AddressPickerSheet from "./AddressPickerSheet";
import BasketSummary from "../../Basket/BasketSummary";
import { validateOrder } from "../../../shared/validation/validators/order/order-validator";
import { useCreateOrderMutation } from "../../../shared/api/ordersApi/ordersApi";
import {
  errorKeys,
  pushError,
} from "../../../features/store/errorHandling/errorHandlingSlice";
import {
  alertStatuses,
  pushAlert,
} from "../../../features/store/alerts/alertSlice";
import { orderPaymentTypes } from "../../../app/static-data/data";
import { clearBasket } from "../../../features/store/basket/basketSlice";
import { addOrder } from "../../../features/store/orders/ordersSlice";
import { selectClient } from "../../../features/store/auth/authSlice";
import {
  selectIsApproximateGeolocation,
  setGeolocation,
} from "../../../features/store/geolocation/geolocationSlice";
import { appendSavedAddress } from "../../../shared/utils/savedAddresses";
import { formatPrice } from "../../../shared/utils/dish";
import { getBasketItemPrice } from "../../../shared/utils/basket";
import { SCREEN_PADDING } from "../../../constants/layout";
import { getLocationLabel } from "../../../shared/utils/geolocation";
import { images } from "../../../app/images/images";
import { Image } from "expo-image";

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_PADDING,
    // room for the sticky submit bar
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  cardTitle: { fontSize: 17, fontWeight: "bold", color: "#111" },
  cardHint: { fontSize: 13, color: "#6b7280", marginTop: 4, lineHeight: 18 },
  current: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: "#f6f6f7",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  currentIcon: { width: 18, height: 18, opacity: 0.6, marginTop: 1 },
  currentLabel: { fontSize: 12, color: "#9ca3af" },
  currentValue: { fontSize: 15, color: "#111", fontWeight: "500", marginTop: 2 },
  currentApprox: { fontSize: 12, color: "#c2410c", marginTop: 4, lineHeight: 16 },
  addressButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#059669",
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 10,
  },
  addressButtonText: { fontSize: 14, color: "#047857", fontWeight: "bold" },
  // The floating label of an input travels above the field, so the block needs
  // headroom or the label lands on the card title
  inputs: { marginTop: 22 },
  payment: { gap: 8, marginTop: 12 },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e4e4e7",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  paymentOptionSelected: { borderColor: "#059669", backgroundColor: "#ecfdf5" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#c4c4c8",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: "#059669" },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#059669",
  },
  paymentLabel: { fontSize: 15, color: "#111" },
  line: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
  },
  lineName: { flex: 1, fontSize: 14, color: "#3f3f46" },
  lineCount: { fontSize: 13, color: "#6b7280" },
  linePrice: { fontSize: 14, fontWeight: "500", color: "#111" },
  time: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  timeText: { fontSize: 13, color: "#6b7280" },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#e8e8ea",
  },
  submit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#059669",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  submitDisabled: { backgroundColor: "#a1a1aa" },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

const Card = ({ title, hint, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {!!hint && <Text style={styles.cardHint}>{hint}</Text>}
    {children}
  </View>
);

// Checkout. Since the address is no longer asked for at startup, this screen is
// where it is really collected - hence the address block first, the saved
// addresses as one-tap fills and the warning when we are still working with a
// guessed location.
const CreateOrder = ({
  pubID,
  pub,
  items = [],
  location,
  shippingTimeFrom,
  shippingTimeTo,
  itemsPrice,
  deliveryPrice,
  currency,
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
  const [paymentType, setPaymentType] = useState(orderPaymentTypes.cash);
  const [isAddressPickerOpened, setIsAddressPickerOpened] = useState(false);

  const client = useSelector(selectClient);
  const isApproximateLocation = useSelector(selectIsApproximateGeolocation);

  useEffect(() => {
    if (!client) return;
    setPhoneNumber(client.phone);
  }, [client]);

  // With an approximate location both of these stay empty - this is the screen
  // where the client finally types the real address
  useEffect(() => {
    if (!location?.town) return;
    setTown(location.town);
  }, [location?.town]);

  useEffect(() => {
    if (!location?.fullAddress) return;
    setFullAddress(location.fullAddress);
  }, [location?.fullAddress]);

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

  // The same wording as the top bar, so "where is this going?" has one answer
  const locationLabel = getLocationLabel(location, t);

  const sendData = () => {
    if (isCreateOrderLoading) return;

    setTriedToSubmit(true);

    if (!areInputsValid) {
      dispatch(
        pushAlert({
          status: alertStatuses.error,
          delay: 2500,
          title: t("create_order_page.additional_data.fill_inputs"),
        }),
      );
      return;
    }

    const dishIDs = Object.keys(basket || {});

    if (dishIDs.length === 0) {
      dispatch(
        pushAlert({
          status: alertStatuses.error,
          delay: 2500,
          title: t("create_order_page.additional_data.empty_basket"),
        }),
      );
      return;
    }

    // Used to only warn and then POST lat: undefined
    if (!location?.lat || !location?.lng) {
      dispatch(
        pushAlert({
          status: alertStatuses.error,
          delay: 3000,
          title: t("create_order_page.additional_data.no_location"),
        }),
      );
      navigator.navigate("SelectGeolocationPage");
      return;
    }

    const dishes = dishIDs.map((dishID) => ({
      dishID,
      count: basket[dishID].count,
    }));

    createOrder({
      order: {
        deliveryPrice: +deliveryPrice,
        town,
        lat: location.lat,
        lng: location.lng,
        fullAddress,
        mainPhoneNumber: phoneNumber,
        secondPhoneNumber,
        comments,
        paymentType,
        pubID,
        dishes,
      },
    });
  };

  useEffect(() => {
    if (!createOrderResponse || !createOrderResponse.ok) return;

    // Checkout is where the real address is collected now, so this is where it
    // gets remembered: the top bar and the next order both read it back.
    dispatch(
      setGeolocation({
        lat: location?.lat,
        lng: location?.lng,
        town,
        fullAddress,
      }),
    );
    appendSavedAddress(dispatch, {
      town,
      fullAddress,
      lat: location?.lat,
      lng: location?.lng,
    });

    dispatch(addOrder(createOrderResponse.order));
    dispatch(clearBasket());
    navigator.navigate("OrderInfoPage", {
      orderID: createOrderResponse.order.id,
    });
  }, [createOrderResponse]);

  const paymentOptions = [
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
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Address */}
        <Card
          title={t("create_order_page.address.title")}
          hint={t("create_order_page.address.hint")}
        >
          {/* What the order is going to be sent with, in plain words */}
          <View style={styles.current}>
            <Image
              source={images.Locaiton}
              style={styles.currentIcon}
              contentFit="contain"
              alt=""
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.currentLabel}>
                {t("create_order_page.address.current")}
              </Text>
              <Text style={styles.currentValue}>
                {locationLabel ?? t("create_order_page.address.unknown")}
              </Text>

              {isApproximateLocation && (
                <Text style={styles.currentApprox}>
                  {t("create_order_page.additional_data.approximate_location")}
                </Text>
              )}
            </View>
          </View>

          {/* One entry point: the sheet holds both the saved addresses and
              the way to add a new one on the map */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsAddressPickerOpened(true)}
          >
            <View style={styles.addressButton}>
              <Text style={styles.addressButtonText}>
                {t("create_order_page.address.change")}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.inputs} />
          <CreateOrderInputs
            section="address"
            town={town}
            setTown={setTown}
            fullAddress={fullAddress}
            setFullAddress={setFullAddress}
            validatedOutside={triedToSubmit}
          />
        </Card>

        {/* Contacts */}
        <Card title={t("create_order_page.contacts.title")}>
          <View style={styles.inputs} />
          <CreateOrderInputs
            section="phones"
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            secondPhoneNumber={secondPhoneNumber}
            setSecondPhoneNumber={setSecondPhoneNumber}
            validatedOutside={triedToSubmit}
          />
        </Card>

        {/* Payment */}
        <Card title={t("create_order_page.additional_data.inputs.payment_type.label")}>
          <View style={styles.payment}>
            {paymentOptions.map((option) => {
              const isSelected = option.value === paymentType;

              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.85}
                  onPress={() => setPaymentType(option.value)}
                >
                  <View
                    style={[
                      styles.paymentOption,
                      isSelected && styles.paymentOptionSelected,
                    ]}
                  >
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.paymentLabel}>{option.text}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Comment */}
        <Card title={t("create_order_page.comment.title")}>
          <View style={styles.inputs} />
          <CreateOrderInputs
            section="comments"
            comments={comments}
            setComments={setComments}
            validatedOutside={triedToSubmit}
          />
        </Card>

        {/* Order */}
        <Card title={t("create_order_page.order.title")} hint={pub?.name}>
          {items.map(({ dish, item }) => (
            <View key={dish.id} style={styles.line}>
              <Text style={styles.lineName} numberOfLines={1}>
                {dish?.name}
              </Text>
              <Text style={styles.lineCount}>× {item?.count}</Text>
              <Text style={styles.linePrice}>
                {formatPrice(getBasketItemPrice(item, pub))} {currency}
              </Text>
            </View>
          ))}

          {isShippingTimeAvailable && (
            <View style={styles.time}>
              <Text style={styles.timeText}>
                {t("create_order_page.additional_data.delivery_time")}:{" "}
                {shippingTimeFrom}–{shippingTimeTo} {t("basket_page.minutes")}
              </Text>
            </View>
          )}

          <BasketSummary
            plain
            itemsPrice={itemsPrice ?? 0}
            deliveryPrice={deliveryPrice ?? null}
            currency={currency}
            leftForFreeDelivery={null}
            freeDeliveryFrom={0}
          />
        </Card>
      </ScrollView>

      <AddressPickerSheet
        isOpened={isAddressPickerOpened}
        onClose={() => setIsAddressPickerOpened(false)}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={sendData}
          disabled={isCreateOrderLoading}
        >
          <View
            style={[
              styles.submit,
              (!areInputsValid || isCreateOrderLoading) && styles.submitDisabled,
            ]}
          >
            {isCreateOrderLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitText}>
                  {t("create_order_page.additional_data.create_order_button")}
                </Text>
                <Text style={styles.submitText}>
                  {formatPrice(totalSum)} {currency}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateOrder;
