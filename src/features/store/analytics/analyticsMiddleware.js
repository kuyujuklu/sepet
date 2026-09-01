import {
  events,
  setAnalyticsEnabled,
  setAnalyticsIdentity,
  track,
} from "../../../shared/analytics/analytics";
import { getBasketCount } from "../../../shared/utils/basket";

// The consent kill switch.
//
// A client who has never been asked has `consent_policy_version: ""` and
// `analytics_consent: false` - indistinguishable from a refusal by the flag
// alone, so the *version* is what says the question was actually answered.
// Undecided keeps tracking on (which is how the app behaved before the record
// existed, and the events carry no PII); an explicit "no" turns it off.
const isTrackingAllowed = (client) => {
  const hasAnswered = !!client?.consentPolicyVersion;

  return hasAnswered ? !!client.analyticsConsent : true;
};

// One seam for the events that come from redux actions. increaseDish is
// dispatched from the home feed, the dish list and the dish popup, so
// tracking it here covers every add-to-basket surface at once.
//
// geolocation/setGeolocation is deliberately NOT handled here even though it
// also fires on every real address pick: every screen that lets a client
// pick an address already calls track(events.addressSelected, {source, ...})
// itself (it's the only place that knows *why* - saved list, current
// location, a new address), and this same action is also dispatched from
// CreateOrder.jsx just to re-confirm the checkout address afterwards, which
// is not an address-selection event at all. Handling it here too used to
// double-fire addressSelected for two of the three real flows.
export const analyticsMiddleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  const result = next(action);

  switch (action?.type) {
    // The client record arrived (login, refresh, "continue as guest"): key
    // every following event on client.id instead of stitching funnels by
    // phone number, and honour a recorded refusal.
    case "auth/setClient": {
      setAnalyticsIdentity(action.payload?.id ?? null);
      setAnalyticsEnabled(isTrackingAllowed(action.payload));
      break;
    }

    case "auth/setAnalyticsConsent": {
      setAnalyticsEnabled(!!action.payload?.accepted);
      break;
    }

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

    // Covers both "Clear" on the basket screen and the "switch pub" confirm
    // (adding a dish from a different pub than the current basket) - only
    // the former is a real abandonment, so it's the only one tracked here.
    // Read from prevState: by the time next(action) has run, the reducer has
    // already reset confirmingAction to null either way.
    case "basket/doClearPopupConfirmingAction": {
      const confirmingAction = prevState.basket?.clearBasketPopup?.confirmingAction;
      if (confirmingAction) break;

      track(events.basketCleared, {
        pub_id: prevState.basket?.pubID ?? null,
        item_count: getBasketCount(prevState.basket?.basket),
      });
      break;
    }

    default:
      break;
  }

  return result;
};
