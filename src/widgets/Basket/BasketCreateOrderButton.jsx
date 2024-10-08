import { useNavigation } from "@react-navigation/native";
import { Button, Spinner } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import {
  selectBasket,
  selectBasketPubID,
} from "../../features/store/basket/basketSlice";
import {
  useGetNearbyPubsQuery,
  useGetPubInfoQuery,
} from "../../shared/api/pubs/pubsApi";
import { useTranslation } from "react-i18next";
import {
  alertStatuses,
  pushAlert,
} from "../../features/store/alerts/alertSlice";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { useCallback, useMemo } from "react";

const BasketCreateOrderButton = ({ itemsPrice, isClosed }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const basket = useSelector(selectBasket);
  const pubID = useSelector(selectBasketPubID);
  const navigator = useNavigation();
  const location = useSelector(selectGeolocation);

  const basketIsEmpty = !basket || Object.keys(basket).length === 0;

  const {
    data: pubData,
    error: gettingPubError,
    isLoading,
  } = useGetPubInfoQuery({ pubID }, { pollingInterval: 20000, skip: !pubID });

  const {
    data: pubsData,
    error: gettingPubsError,
    isLoading: isPubsLoading,
  } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location, pollingInterval: 20000 },
  );


  const handleButtonPress = () => {
    if (isClosed) {
      dispatch(
        pushAlert({
          status: alertStatuses.warning,
          delay: 2000,
          title: t("basket_page.pub_is_closed_error"),
        }),
      );
      return;
    }

    navigator.navigate("CreateOrder", {
      itemsPrice,
      pubID,
      shippingTimeFrom: pubData?.pub?.shipping?.shipping_time_from,
      shippingTimeTo: pubData?.pub?.shipping?.shipping_time_to,
    });
  };

  return (
    <Button
      disabled={basketIsEmpty || !pubData?.pub}
      background={
        basketIsEmpty || !pubData?.pub ? "coolGray.400" : "emerald.600"
      }
      borderRadius={15}
      onPress={handleButtonPress}
    >
      {isLoading ? <Spinner /> : t("basket_page.create_order_button")}
    </Button>
  );
};

export default BasketCreateOrderButton;
