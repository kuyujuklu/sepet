import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  useGetNearbyPubsQuery,
  useLazyGetPubInfoQuery,
} from "../../shared/api/pubs/pubsApi";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import {
  alertStatuses,
  pushAlert,
} from "../../features/store/alerts/alertSlice";
import { setBasket } from "../../features/store/basket/basketSlice";
import { Screens } from "../../app/navigation/screens";

// "Repeat the order" lives on both the card and the order screen and has to
// behave identically in both, so it lives here instead of being copied.
//
// The menu of the pub is fetched lazily: the prices of a past order cannot be
// trusted (a dish may be gone or cost something else today), but there is no
// reason to load eight menus just to render a list of orders.
export const useRepeatOrder = (order) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigator = useNavigation();

  const location = useSelector(selectGeolocation);

  // Shared cache entry: every card on the screen resolves to one request
  const { data: pubsData } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location, pollingInterval: 20000, skipPollingIfUnfocused: true },
  );

  const [fetchPubInfo, { isFetching: isLoading }] = useLazyGetPubInfoQuery();

  const warn = (title, status = alertStatuses.warning, delay = 2000) =>
    dispatch(pushAlert({ status, delay, title: t(title) }));

  const repeatOrder = async () => {
    if (!order?.dishes || order.dishes.length === 0) {
      warn("order_page.order_card.unable_to_repeat_order");
      return;
    }

    const foundPub = pubsData?.pubs?.find((pub) => pub.id === order.pub_id);

    // Without a location we do not know the delivery zone at all; let the
    // basket screen say so instead of blocking the client here
    if (pubsData?.pubs && !foundPub) {
      warn(
        "errors.this_pub_is_not_delivering_in_your_area",
        alertStatuses.error,
        3000,
      );
      return;
    }

    if (foundPub && !foundPub.isOpen) {
      warn("errors.in_this_time_delivery_not_working", alertStatuses.error, 3000);
      return;
    }

    const pubData = await fetchPubInfo({ pubID: order.pub_id })
      .unwrap()
      .catch(() => null);

    if (!pubData?.dishes) {
      warn("order_page.order_card.unable_to_repeat_order");
      return;
    }

    const newBasket = {};

    for (const { dish_id, count } of order.dishes) {
      const dish = pubData.dishes.find((item) => item.id === dish_id);

      // A dish that is no longer on the menu makes the repeat meaningless -
      // the client would pay for a basket that is not the order they saw
      if (!dish) {
        warn("order_page.order_card.unable_to_repeat_order");
        return;
      }

      const price =
        +dish.sale_price && +dish.sale_price < +dish.price
          ? +dish.sale_price
          : +dish.price;

      newBasket[dish_id] = { count, price };
    }

    dispatch(setBasket({ basket: newBasket, pubID: order.pub_id }));
    // Once, after the basket is filled - the old code navigated inside the
    // loop, so a three-dish order pushed the basket screen three times
    navigator.navigate(Screens.Basket);
  };

  return { repeatOrder, isLoading };
};

export default useRepeatOrder;
