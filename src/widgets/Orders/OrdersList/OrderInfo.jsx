import { useDispatch, useSelector } from "react-redux";
import { selectOrders } from "../../../features/store/orders/ordersSlice";
import { useEffect, useMemo } from "react";
import { ScrollView, Spinner, Text, View } from "native-base";
import {
  ConvertApiTimeToLocalDayMonth,
  ConvertApiTimeToLocalDayMonthYear,
} from "../../../shared/utils/time";
import { SafeAreaView, TouchableOpacity } from "react-native";
import { Pressable } from "native-base";
import {
  useGetNearbyPubsQuery,
  useGetPubInfoQuery,
} from "../../../shared/api/pubs/pubsApi";
import { useTranslation } from "react-i18next";
import {
  AnonymousProBold,
  AnonymousProRegular,
} from "../../../constants/styles-constants";
import RateOrderButton from "./RateOrderButton";
import { Image } from "expo-image";
import { images } from "../../../app/images/images";
import { selectGeolocation } from "../../../features/store/geolocation/geolocationSlice";
import {
  alertStatuses,
  pushAlert,
} from "../../../features/store/alerts/alertSlice";
import { setBasket } from "../../../features/store/basket/basketSlice";
import { useNavigation } from "@react-navigation/native";
import {
  getOrderStatusColor,
  getOrderStatusText,
} from "../../../shared/utils/order-utils";
import { setNavbarExpanded } from "../../../features/store/navbar/navbarSlice";
import { Screens } from "../../../../App";

const OrderInfo = ({ orderID }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const navigator = useNavigation();
  const order = useMemo(() => {
    return orders?.find((order) => order.id === orderID);
  }, [orders]);

  useEffect(() => {
    if (!orders) return;
    if (!order) navigator.navigate(Screens.Orders)
  }, [order, orders])

  const location = useSelector(selectGeolocation);

  const { data: pubsData, isLoading: isPubsDataLoading } =
    useGetNearbyPubsQuery(
      {
        coords: { lat: location.lat, lng: location.lng },
      },
      { pollingInterval: 20000, skipPollingIfUnfocused: true },
    );
  const { data: pubData, isLoading: isPubDataLoading } = useGetPubInfoQuery({
    pubID: order?.pub_id,
  });
  const pub = pubData ?? null;

  const itemsPrice = order?.dishes?.reduce((acc, dish) => {
    acc = +acc;
    const price = acc + dish.count * dish.dish_price;
    if (!price) return acc;
    else return price.toFixed(2);
  }, 0);
  const deliveryPrice = order?.delivery_price?.toFixed(2) ?? undefined;
  const totalSum =
    itemsPrice && deliveryPrice
      ? (+itemsPrice + +deliveryPrice).toFixed(2)
      : undefined;

  const dishes = useMemo(() => {
    if (!order || !order.dishes || !pub || !pub.dishes) {
      return [];
    }

    const dishes = [];

    for (const order_dish of order.dishes) {
      const pub_dish = pub?.dishes?.find(
        (dish) => dish.id === order_dish.dish_id,
      );
      if (!pub_dish) {
        continue;
      }

      dishes.push({
        ...pub_dish,
        order_dish_count: order_dish.count,
        order_dish_price: order_dish.dish_price,
      });
    }

    return dishes;
  }, [order, pub]);

  const handleRepeatClick = () => {
    if (!pubsData || !pubsData?.pubs) return;
    if (!pubData || !pubData.dishes) return;

    if (!order?.dishes || order?.dishes.length === 0) {
      dispatch(
        pushAlert({
          status: alertStatuses.warning,
          delay: 2000,
          title: t("order_page.order_card.unable_to_repeat_order"),
        }),
      );
      return;
    }

    let foundID = false;
    let foundPub = null;
    for (const pub of pubsData.pubs) {
      if (order.pub_id === pub.id) {
        foundID = true;
        foundPub = pub;
      }
    }

    if (!foundPub || !foundID) {
      dispatch(
        pushAlert({
          title: t("errors.this_pub_is_not_delivering_in_your_area"),
          status: alertStatuses.error,
          delay: 3000,
        }),
      );
      return;
    }

    if (!foundPub?.isOpen) {
      dispatch(
        pushAlert({
          title: t("errors.in_this_time_delivery_not_working"),
          status: alertStatuses.error,
          delay: 3000,
        }),
      );
      return;
    }

    const newBasket = {};

    for (const { dish_id, count } of order?.dishes) {
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
    dispatch(setBasket({ basket: newBasket, pubID: order?.pub_id }));
  };

  return (
    <>
      <Text fontWeight="medium" fontSize="2xl" px="6" textAlign="center" mb="5">
        {t("order_info_page.order")} №{orderID}
      </Text>
      <View flexDir="row" alignItems="center" px="6" gap="2" mb={2}>
        <View width={25} height={25}>
          <Image
            source={images.KnifeInPlateBlack}
            alt=""
            style={{ width: "100%", height: "100%" }}
          />
        </View>
        <Text fontWeight="medium" fontSize="xl" >
          {order?.pub?.name}
        </Text>
      </View>
      <View flexDir="row" alignItems="center" px="6" gap="2" mb="4">
        <View width={25} height={25}>
          <Image
            source={images.Locaiton}
            alt=""
            style={{ width: "100%", height: "100%" }}
          />
        </View>
        <Text fontWeight="medium" fontSize="xl" numberOfLines={1} >
          {order?.town + ", " + order?.full_address}
        </Text>
      </View>
      <View flexDir="row" alignItems="center" gap={2} mb="8" px="6">
        <Text
          fontSize="xl"
          fontWeight="bold"
          color={getOrderStatusColor(order?.status)}
        >
          {t(getOrderStatusText(order?.status))}
          {"  "}
          {ConvertApiTimeToLocalDayMonthYear(order?.created_time, i18n.language)}
        </Text>
      </View>
      {isPubDataLoading && <Spinner />}
      {!isPubDataLoading && (
        <ScrollView>
          <View px="8" gap={2}>
            {dishes?.map((dish, index) => (
              <View flexDir="row" justifyContent="space-between" gap="5">
                <Text numberOfLines={1} flex={1} fontSize="xl" color="coolGray.600">
                  {index + 1}.{dish.name}
                </Text>
                <View flexDir="row">
                  <View flexDir="row">
                    <Text fontSize="lg" color="coolGray.600">
                      {(dish.order_dish_price).toFixed(
                        2,
                      )}{" "}
                    </Text>
                    <Text fontSize="lg" color="coolGray.600">
                      Lei
                    </Text>
                  </View>
                  <View ml="2" flexDir="row" alignItems="center">
                    <Text fontSize="xs">x</Text>
                    <Text fontSize="md">{dish.order_dish_count}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
      <View px="6" gap="1" mb="4" mt="6">
        <Text color="gray.600" fontFamily={AnonymousProRegular} fontSize={18}>
          {t("create_order_page.additional_data.items_price")}: {itemsPrice} Lei
        </Text>
        <Text color="gray.600" fontFamily={AnonymousProRegular} fontSize={18}>
          {t("create_order_page.additional_data.delivery_price")}:{" "}
          {deliveryPrice} Lei
        </Text>
        <Text color="gray.600" fontFamily={AnonymousProBold} fontSize={18}>
          {t("create_order_page.additional_data.total_sum")}: {totalSum} Lei
        </Text>
      </View>

      <Pressable px="6" py="1" gap="2" mb="4" m="2" borderWidth={2} borderColor="coolGray.500" borderRadius="xl" onPress={() => dispatch(setNavbarExpanded(true))}>
        <Text color="gray.600" fontFamily={AnonymousProRegular} lineHeight={22} fontSize={18}>
          {t("order_info_page.all_changes_from_tech")}{" "}
          <Text color="emerald.600" textDecorationLine="underline" fontFamily={AnonymousProRegular} lineHeight={22} fontSize={18}>
            {t("order_info_page.support")}.
          </Text>
        </Text>
      </Pressable>
      <View
        px="6"
        mt={2}
        mb={8}
        flexDir="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <RateOrderButton
          orderStatus={order?.status}
          rating={order?.rating}
          orderID={order?.id}
          iconSize={22}
          fontSize={18}
        />
        <TouchableOpacity onPress={handleRepeatClick}>
          <View flexDir="row" alignItems="center" gap={2}>
            <View width={22} height={22}>
              <Image
                source={images.AgainBlack}
                alt=""
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <Text fontSize="18">
              {t("order_page.order_card.repeat_button")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default OrderInfo;
