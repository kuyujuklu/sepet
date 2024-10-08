import { Text, View } from "native-base";
import Wrapper from "../Wrapper";
import CreateOrder from "../../widgets/Orders/CreateOrder/CreateOrder";
import { useSelector } from "react-redux";
import { selectBasket } from "../../features/store/basket/basketSlice";
import { useTranslation } from "react-i18next";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { useMemo } from "react";
import { useGetNearbyPubsQuery, useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";
import { deliveryTypes } from "../../app/static-data/data";

const CreateOrderPage = ({ route }) => {
  const { t } = useTranslation();
  const shippingTimeFrom = route?.params?.shippingTimeFrom;
  const shippingTimeTo = route?.params?.shippingTimeTo;

  const pubID = route?.params?.pubID;

  const basket = useSelector(selectBasket);
  const location = useSelector(selectGeolocation);

  const {
    data: pubsData,
    error: gettingPubsError,
    isLoading: isPubsLoading,
  } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location, pollingInterval: 20000 },
  );
  const { data: pubData } = useGetPubInfoQuery(
    { pubID },
    { pollingInterval: 20000, skip: !pubID },
  );

  const deliveryPrice = useMemo(() => {
    if (!pubsData || !pubID) return;

    const pub = pubsData.pubs.find((pub) => pub.id === pubID);
    if (!pub) {
      return 0;
    }

    return pub.shipping_price;
  }, [pubsData, pubID]);

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
        <CreateOrder
          location={location}
          basket={basket}
          pubID={pubID}
          shippingTimeFrom={shippingTimeFrom}
          shippingTimeTo={shippingTimeTo}
          itemsPrice={itemsPrice}
          deliveryPrice={deliveryPrice}
        />
      </View>
    </Wrapper>
  );
};

export default CreateOrderPage;
