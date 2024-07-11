import { Image, Spinner, Text, View } from "native-base";
import { AnonymousProBold } from "../../../constants/styles-constants";
import { images } from "../../../app/images/images";
import { ConvertApiTimeToLocalDayMonthYear } from "../../../shared/utils/time";
import { orderStatuses } from "../../../app/static-data/data";
import { useEffect, useMemo, useRef } from "react";
import { TouchableOpacity } from "react-native";
import {
  useGetNearbyPubsQuery,
  useGetPubInfoQuery,
} from "../../../shared/api/pubs/pubsApi";
import { useDispatch, useSelector } from "react-redux";
import { selectGeolocation } from "../../../features/store/geolocation/geolocationSlice";
import {
  alertStatuses,
  pushAlert,
} from "../../../features/store/alerts/alertSlice";
import forbidPropTypes from "eslint-plugin-react/lib/rules/forbid-prop-types";
import { setBasket } from "../../../features/store/basket/basketSlice";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useRateOrderMutation } from "../../../shared/api/ordersApi/ordersApi";
import RateOrderButton from "./RateOrderButton";

const getOrderStatusText = (status) => {
  switch (status) {
    case orderStatuses.notHandled:
      return "order_page.order_card.order_statuses.not_handled";
    case orderStatuses.handled:
      return "order_page.order_card.order_statuses.handled";
    case orderStatuses.preparing:
      return "order_page.order_card.order_statuses.preparing";
    case orderStatuses.completed:
      return "order_page.order_card.order_statuses.completed";
    case orderStatuses.canceled:
      return "order_page.order_card.order_statuses.canceled";
  }
};

const getOrderStatusColor = (status) => {
  switch (status) {
    case orderStatuses.notHandled:
      return "red.300";
    case orderStatuses.handled:
      return "yellow.500";
    case orderStatuses.preparing:
      return "orange.400";
    case orderStatuses.completed:
      return "emerald.600";
    case orderStatuses.canceled:
      return "gray.600";
  }
};

const OrderCard = ({ order, allPubs }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigator = useNavigation();
  const positionsCount = useMemo(() => {
    return order?.dishes?.reduce((acc, item) => acc + item.count, 0);
  }, [order]);

  const location = useSelector(selectGeolocation);

  const { data: pubsData, isLoading: isPubsDataLoading } =
    useGetNearbyPubsQuery(
      {
        coords: { lat: location.lat, lng: location.lng },
      },
      { pollingInterval: 20000, skipPollingIfUnfocused: true },
    );

  const { data: pubData, isLoading: isPubDataLoading } = useGetPubInfoQuery({
    pubID: order.pub_id,
  });

  const handleRepeatClick = () => {
    if (!pubsData || !pubsData?.pubs) return;
    if (!pubData || !pubData.dishes) return;

    if (!order.dishes || order.dishes.length === 0) {
      dispatch(
        pushAlert({
          status: alertStatuses.warning,
          delay: 2000,
          title: t("order_page.order_card.unable_to_repeat_order"),
        }),
      );
      return;
    }

    const openedPubs = pubsData.pubs.filter((pub) => pub.isOpen);

    let foundID = false;
    for (const pub of openedPubs) {
      if (order.pub_id === pub.id) {
        foundID = true;
      }
    }

    if (!foundID) {
      dispatch(
        pushAlert({
          title: t("errors.this_pub_is_not_delivering_in_your_area"),
          status: alertStatuses.error,
          delay: 3000,
        }),
      );
      return;
    }

    const newBasket = {};

    for (const { dish_id, count } of order.dishes) {
      let smallestPrice = 0;
      let dishFound = false;
      for (const dish of pubData.dishes) {
        if (dish.id !== dish_id) continue;

        dishFound = true;

        smallestPrice = +dish.price;
        if (+dish.sale_price && +dish.sale_price < +dish.price) {
          smallestPrice = dish.sale_price;
        }
        break;
      }
      console.log("Dish id: ", dish_id, " count: ", count);
      if (!dishFound) {
        dispatch(
          pushAlert({
            status: alertStatuses.warning,
            delay: 2000,
            title: t("order_page.order_card.unable_to_repeat_order"),
          }),
        );
        return;
      }

      newBasket[dish_id] = { count: count, price: smallestPrice };
      navigator.navigate("Basket");
    }
    dispatch(setBasket({ basket: newBasket, pubID: order.pub_id }));
  };

  if (isPubsDataLoading || isPubDataLoading) {
    return (
      <View
        style={{ height: 110 }}
        px="5"
        py="2"
        shadow={"9"}
        // borderWidth={1}
        background={"white"}
        // borderColor={getOrderStatusColor(order?.status) || "#aaa"}
        rounded="2xl"
        w="full"
        flexDir="row"
      >
        <Spinner />
      </View>
    );
  }

  return (
    <View background={"white"} shadow={"9"} rounded="2xl" px="5" py="2">
      <View flex={1} justifyContent="center" overflow="hidden">
        <Text fontSize="19" fontFamily={AnonymousProBold}>
          {t("order_page.order_card.order")} {order?.id}
        </Text>
      </View>
      <View
        style={{ height: 90 }}
        // borderWidth={1}
        // borderColor={getOrderStatusColor(order?.status) || "#aaa"}
        w="full"
        flexDir="row"
      >
        <View w="65%" h="full" justifyContent="space-between">
          <View flex={1} justifyContent="center" overflow="hidden">
            <Text fontSize="19" fontFamily={AnonymousProBold}>
              {order?.pub_name}
            </Text>
          </View>
          <View flex={1} justifyContent="center">
            <View flexDir="row" alignItems="center" gap={2}>
              <View width={17} height={17}>
                <Image
                  source={images.DishPlateBlack}
                  alt=""
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
              <Text fontSize="12">
                {positionsCount} {t("order_page.order_card.positions")}
              </Text>
            </View>
          </View>
          <View flex={1} justifyContent="center">
            <RateOrderButton
              orderStatus={order.status}
              rating={order.rating}
              orderID={order.id}
            />
          </View>
        </View>
        <View w="90%" h="full" justifyContent="space-between">
          <View flex={1} justifyContent="center">
            <View flexDir="row" alignItems="center" gap={2}>
              <Text
                fontWeight="bold"
                color={getOrderStatusColor(order?.status)}
              >
                {t(getOrderStatusText(order?.status))}
              </Text>
            </View>
          </View>
          <View flex={1} justifyContent="center">
            <View flexDir="row" alignItems="center" gap={2}>
              <View width={15} height={15}>
                <Image
                  source={images.CalendarBlack}
                  alt=""
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
              <Text fontSize="12">
                {ConvertApiTimeToLocalDayMonthYear(order?.created_time)}
              </Text>
            </View>
          </View>
          <View flex={1} justifyContent="center">
            <TouchableOpacity onPress={handleRepeatClick}>
              <View flexDir="row" alignItems="center" gap={2}>
                <View width={15} height={15}>
                  <Image
                    source={images.AgainBlack}
                    alt=""
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>
                <Text fontSize="12">
                  {t("order_page.order_card.repeat_button")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default OrderCard;
