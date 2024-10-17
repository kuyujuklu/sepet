import { orderStatuses } from "../static-data/data";

export const getOrderColor = (orderStatus) => {
    switch (orderStatus) {
      case orderStatuses.notHandled:
        return "#ef4444";
      case orderStatuses.preparing:
        return "#ed5e21";
      case orderStatuses.atCourier:
        return "#3b82f6";
      case orderStatuses.completed:
        return "#059669";
      case orderStatuses.canceled:
        return "#4a4a48";
      default:
        return "#fff";
    }
  };
  
  export const translateOrderStatus = (status) => {
    switch (status) {
      case orderStatuses.notHandled:
        return "admin.admin_panel.order_page.order_statuses.not_handled";
  
      case orderStatuses.handled:
        return "admin.admin_panel.order_page.order_statuses.handled";
      case orderStatuses.preparing:
        return "admin.admin_panel.order_page.order_statuses.preparing";
  
      case orderStatuses.atCourier:
        return "admin.admin_panel.order_page.order_statuses.at_courier";
  
      case orderStatuses.completed:
        return "admin.admin_panel.order_page.order_statuses.completed";
      case orderStatuses.canceled:
        return "admin.admin_panel.order_page.order_statuses.canceled";
      default:
      return "unknown";
    }
  };
  