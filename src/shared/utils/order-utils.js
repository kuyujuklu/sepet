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
  
  export const getOrderStatusColor = (status) => {
    switch (status) {
      case orderStatuses.notHandled:
        return "red.300";
      case orderStatuses.handled:
        return "yellow.500";
      case orderStatuses.preparing:
        return "yellow.500";
      case orderStatuses.atCourier:
          return "orange.400";
      case orderStatuses.completed:
        return "emerald.600";
      case orderStatuses.canceled:
        return "gray.600";
    }
  };