import { events, track } from "../../../shared/analytics/analytics";

// One seam for the events that come from redux actions. increaseDish is
// dispatched from the home feed, the dish list and the dish popup, so
// tracking it here covers every add-to-basket surface at once.
export const analyticsMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  switch (action?.type) {
    case "basket/increaseDish":
      track(events.dishAdded, {
        dish_id: action.payload?.id,
        pub_id: action.payload?.pubID,
        price: action.payload?.price,
      });
      break;

    case "basket/decreaseDish":
      track(events.dishRemoved, { dish_id: action.payload?.id });
      break;

    case "geolocation/setGeolocation":
      if (action.payload) {
        track(events.addressSelected, { town: action.payload?.town });
      }
      break;

    default:
      break;
  }

  return result;
};
