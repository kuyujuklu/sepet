import DishList from "../../widgets/Dish/DishList";
import {
  useGetNearbyPubsQuery,
  useGetPubInfoQuery,
} from "../../shared/api/pubs/pubsApi";
import { useDispatch, useSelector } from "react-redux";
import {
  clearBasket,
  selectBasket,
  selectBasketPubID,
} from "../../features/store/basket/basketSlice";
import BasketCreateOrderButton from "../../widgets/Basket/BasketCreateOrderButton";
import Wrapper from "../Wrapper";
import { Text, View } from "native-base";
import { useTranslation } from "react-i18next";
import { memo, useEffect, useState } from "react";
import AnimatedNumber from "react-native-animated-numbers";
import { AnonymousProBold } from "../../constants/styles-constants";
import { deliveryTypes } from "../../app/static-data/data";
import { Platform } from "react-native";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { selectClient } from "../../features/store/auth/authSlice";
import BasketGoToRegistrationButton from "../../widgets/Basket/BasketGoToRegistrationButton";

const BasketPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const pubID = useSelector(selectBasketPubID);
  const { data: pubData } = useGetPubInfoQuery(
    { pubID },
    { pollingInterval: 20000, skip: !pubID },
  );

  const basket = useSelector(selectBasket);
  const location = useSelector(selectGeolocation);

  const client = useSelector(selectClient);

  const {
    data: pubsData,
    error: gettingPubsError,
    isLoading: isPubsLoading,
  } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location, pollingInterval: 20000 },
  );

  const [isAvailableForDelivery, setIsAvailableForDelivery] = useState(true);
  useEffect(() => {
    if (!pubsData || !pubsData.pubs) {
      return;
    }
    if (!pubsData.pubs.find((pub) => pub.id === pubID)) {
      setIsAvailableForDelivery(false);
      return;
    }
  }, [pubsData]);

  const itemsPrice = Object.keys(basket).reduce((acc, key) => {
    const dish = basket[key];

    const shouldAddCommission =
      pubData?.pub?.shipping?.delivery_type === deliveryTypes.deliveryService &&
      pubData?.pub?.shipping?.add_commission_to_dish_prices;

    let commission = shouldAddCommission
      ? dish.count *
      dish.price *
      (pubData?.pub?.shipping?.commission_for_dish_prices / 100)
      : 0;

    if (!commission) commission = 0;
    else commission = Math.ceil(commission);

    return acc + dish.count * dish.price + commission;
  }, 0);

  return (
    <Wrapper>
      <View flex={1}>
        <DishList
          upperElement={
            <View
              mt={3}
              flexDir="row"
              justifyContent="center"
              alignItems="center"
            >
              <Text
                textAlign="center"
                fontSize={25}
                textTransform="uppercase"
                fontWeight="bold"
              >
                {t("basket_page.headline")} (
              </Text>
              {itemsPrice ? <Number number={itemsPrice} /> : <></>}
              <Text textAlign="center" fontSize={25} fontWeight="bold">
                {itemsPrice ? " Lei" : t("basket_page.empty")})
              </Text>
            </View>
          }
          pubID={pubID}
          dishes={pubData?.dishes?.filter(
            (dish) => basket[dish.id]?.count && basket[dish.id]?.count > 0,
          )}
          isAvailableForDelivery={isAvailableForDelivery}
          isPubOpen={pubData?.pub.isOpen}
          pub={pubData?.pub}
        />
      </View>

      <View
        position="absolute"
        w="full"
        px="2"
        style={{ bottom: Platform.OS === "ios" ? 85 : 60 }}
        borderRadius={15}
      >
        {!client || client.isGuest ? (
          <BasketGoToRegistrationButton />
        ) : (
          <BasketCreateOrderButton
            itemsPrice={itemsPrice}
            isAvailableForDelivery={isAvailableForDelivery}
            isPubOpen={pubData?.pub.isOpen}
          />
        )}
      </View>
    </Wrapper>
  );
};

const Number = memo(function Number({ number }) {
  return (
    <AnimatedNumber
      includeComma
      animateToNumber={number}
      animationDuration={500}
      fontStyle={{
        fontSize: 25,
        fontFamily: AnonymousProBold,
        fontWeight: "bold",
        textAlign: "center",
      }}
    />
  );
});

export default BasketPage;
