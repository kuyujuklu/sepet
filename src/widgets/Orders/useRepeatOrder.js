import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useLazyGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import {
  alertStatuses,
  pushAlert,
} from "../../features/store/alerts/alertSlice";
import { setBasket } from "../../features/store/basket/basketSlice";
import { isDishAvailable } from "../../shared/utils/dish";
import { Screens } from "../../app/navigation/screens";

// "Repeat the order" lives on both the card and the order screen and has to
// behave identically in both, so it lives here instead of being copied.
//
// The menu is fetched lazily and only for today's prices: an order carries the
// name and the price of every line as a snapshot, but those prices cannot be
// charged again - a dish may cost something else, be on the stop list or be
// gone. Asking with coordinates makes the one response answer "does this pub
// deliver here" and "is it open" too, so there is no nearby-pubs list to
// consult first.
export const useRepeatOrder = (order) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigator = useNavigation();

  const location = useSelector(selectGeolocation);

  const [fetchPubInfo, { isFetching: isLoading }] = useLazyGetPubInfoQuery();

  const warn = (title, status = alertStatuses.warning, delay = 2000) =>
    dispatch(pushAlert({ status, delay, title: t(title) }));

  const repeatOrder = async () => {
    if (!order?.dishes || order.dishes.length === 0) {
      warn("order_page.order_card.unable_to_repeat_order");
      return;
    }

    const pubData = await fetchPubInfo({
      pubID: order.pub_id,
      coords: location ? { lat: location.lat, lng: location.lng } : undefined,
    })
      .unwrap()
      .catch(() => null);

    if (!pubData?.dishes) {
      warn("order_page.order_card.unable_to_repeat_order");
      return;
    }

    // Only meaningful when we had coordinates to ask with; without a location
    // we do not know the delivery zone at all and let the basket screen say so
    if (location && pubData.pub?.isAvailableForDelivery === false) {
      warn(
        "errors.this_pub_is_not_delivering_in_your_area",
        alertStatuses.error,
        3000,
      );
      return;
    }

    if (pubData.pub?.isOpen === false) {
      warn("errors.in_this_time_delivery_not_working", alertStatuses.error, 3000);
      return;
    }

    const newBasket = {};

    for (const { dish_id, count } of order.dishes) {
      const dish = pubData.dishes.find((item) => item.id === dish_id);

      // A dish that is off the menu or on the stop list makes the repeat
      // meaningless - the client would pay for a basket that is not the order
      // they saw
      if (!dish || !isDishAvailable(dish)) {
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
