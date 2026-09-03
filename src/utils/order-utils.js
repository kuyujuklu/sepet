import { orderStatuses } from "../static-data/data";

export const getOrderColor = (orderStatus) => {
    switch (orderStatus) {
      case orderStatuses.notHandled:
        return "#e0483a";
      case orderStatuses.preparing:
        return "#f2994a";
      case orderStatuses.atCourier:
        return "#2D7DD2";
      case orderStatuses.completed:
        return "#1a9e6b";
      case orderStatuses.canceled:
        return "#8a94a0";
      default:
        return "#fff";
    }
  };
  
  // Tinted background for status pills/left-borders - matches the canvas
  // mockup's per-status --s-*-tint values exactly rather than deriving an
  // alpha suffix from getOrderColor (its default-case "#fff" would break
  // that trick, and the mockup's alphas aren't uniform across statuses).
  export const getOrderColorTint = (orderStatus) => {
    switch (orderStatus) {
      case orderStatuses.notHandled:
        return "rgba(224,72,58,.1)";
      case orderStatuses.preparing:
        return "rgba(242,153,74,.12)";
      case orderStatuses.atCourier:
        return "#e8f1fb";
      case orderStatuses.completed:
        return "rgba(26,158,107,.1)";
      case orderStatuses.canceled:
        return "rgba(138,148,160,.12)";
      default:
        return "#f2f4f6";
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
  