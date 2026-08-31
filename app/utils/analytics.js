import { addCommissionToPrice } from "./dish";

// The GTM container (see layout.js) creates window.dataLayer synchronously on
// every page load, whether or not gtm.js itself ever loads - this guard is
// only for the edge cases that isn't true (SSR, a stripped dataLayer), so a
// tracking call can never throw and break the actual feature it's attached to.
const push = (payload) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
};

// GA4/GTM's own recommendation: null the previous ecommerce object before
// pushing a new one, so this event's `items` can't deep-merge with an
// earlier event's leftover fields.
export const trackEcommerceEvent = (event, ecommerce) => {
  push({ ecommerce: null });
  push({ event, ecommerce });
};

// Basket rows -> GA4 item objects, commission-inclusive so the tracked value
// matches what the client actually sees and pays, not the pub's raw price -
// the same number computeBasketSubtotal (utils/dish.js) sums for the receipt.
export const buildEcommerceItems = (basketItems, commission) =>
  basketItems.map(({ dish, count }) => {
    const hasSale = !!dish.sale_price && dish.sale_price < dish.price;
    return {
      item_id: String(dish.id),
      item_name: dish.name,
      price: addCommissionToPrice(hasSale ? dish.sale_price : dish.price, commission),
      quantity: count,
    };
  });
