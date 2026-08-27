import { orderStatuses } from "../../app/static-data/data";

export const getOrderStatusText = (status) => {
  switch (status) {
    case orderStatuses.notHandled:
      return "order_page.order_card.order_statuses.not_handled";
    case orderStatuses.handled:
      return "order_page.order_card.order_statuses.handled";
    case orderStatuses.preparing:
      return "order_page.order_card.order_statuses.preparing";
    case orderStatuses.atCourier:
      return "order_page.order_card.order_statuses.at_courier";
    case orderStatuses.completed:
      return "order_page.order_card.order_statuses.completed";
    case orderStatuses.canceled:
      return "order_page.order_card.order_statuses.canceled";
  }
};

// Real hex values, not native-base tokens: the order screens are plain
// react-native styles now, like the rest of the redesigned app. Each status
// is a tinted badge - a text colour and the background it sits on.
export const getOrderStatusColors = (status) => {
  switch (status) {
    case orderStatuses.notHandled:
      return { color: "#92400e", background: "#fef3c7" };
    // Was the same amber as notHandled - a client could not tell "just
    // placed" from "the restaurant has seen it" apart at a glance
    case orderStatuses.handled:
      return { color: "#4338ca", background: "#e0e7ff" };
    case orderStatuses.preparing:
      return { color: "#c2410c", background: "#ffedd5" };
    case orderStatuses.atCourier:
      return { color: "#1d4ed8", background: "#dbeafe" };
    case orderStatuses.completed:
      return { color: "#047857", background: "#d1fae5" };
    case orderStatuses.canceled:
      return { color: "#52525b", background: "#f4f4f5" };
    default:
      return { color: "#52525b", background: "#f4f4f5" };
  }
};

// One glyph per status, shown inside the badge next to its text.
export const getOrderStatusIcon = (status) => {
  switch (status) {
    case orderStatuses.notHandled:
      return "time-outline";
    case orderStatuses.handled:
      return "checkmark-circle-outline";
    case orderStatuses.preparing:
      return "restaurant-outline";
    case orderStatuses.atCourier:
      return "bicycle-outline";
    case orderStatuses.completed:
      return "checkmark-done-circle";
    case orderStatuses.canceled:
      return "close-circle-outline";
    default:
      return "help-circle-outline";
  }
};

// Position of a status along the normal (non-cancelled) order lifecycle, for
// a progress indicator - null for canceled/unknown, which are not a point on
// that line.
const ORDER_PROGRESS_STEPS = [
  orderStatuses.notHandled,
  orderStatuses.handled,
  orderStatuses.preparing,
  orderStatuses.atCourier,
  orderStatuses.completed,
];

export const getOrderStatusStep = (status) => {
  const index = ORDER_PROGRESS_STEPS.indexOf(status);

  return index === -1 ? null : index;
};
