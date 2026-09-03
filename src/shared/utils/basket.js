import { getPubCommission } from "./dish";

// The money math of the basket, in one place.
//
// POST /api/client/orders/preview is the authoritative source for what a
// basket costs - it is priced by the same code that prices the order, and it
// is the only thing that knows the pub's minimum. What is left here is the
// local fallback the screens fall back to while the preview is in flight or
// when it failed (offline), so a basket still shows a total instead of a
// dash. The two can disagree by a rounding step; the preview always wins once
// it arrives.
//
// The commission is rounded up *per dish*, so summing first and rounding
// later gives a different number - which is why this lives in one function
// rather than copy-pasted into the basket page, the floating bar and checkout.
//
// Prices in the basket are stored WITHOUT the delivery-service commission - it
// is added here, at display time.

export const getBasketCount = (basket) =>
  Object.values(basket || {}).reduce((acc, item) => acc + (+item?.count || 0), 0);

export const getBasketItemsPrice = (basket, pub) => {
  const commission = getPubCommission(pub);

  return Object.values(basket || {}).reduce((acc, item) => {
    const count = +item?.count || 0;
    const price = +item?.price || 0;

    const itemCommission = commission
      ? Math.ceil(count * price * (commission / 100))
      : 0;

    return acc + count * price + itemCommission;
  }, 0);
};

// The price of one line of the basket, with the same rounding
export const getBasketItemPrice = (item, pub) => {
  const commission = getPubCommission(pub);
  const count = +item?.count || 0;
  const price = +item?.price || 0;

  const itemCommission = commission
    ? Math.ceil(count * price * (commission / 100))
    : 0;

  return count * price + itemCommission;
};

// `nearbyPub` is the entry of get-nearby-pubs: the delivery price and the
// free-delivery threshold live there, not on the pub of pub-info. Also
// called with a pub-info pub directly (BasketPage) - unlike the nearby-pubs
// list (which never includes a pub outside its own delivery zone in the
// first place), a pub-info pub can be out of zone for the client's current
// address, which the server signals with shipping.available === false
// rather than a null/missing shipping_price (that field is just 0 there,
// same as a genuinely free zone) - null here matches this file's existing
// "nothing to show" convention (see getAmountLeftForFreeDelivery).
export const getDeliveryPrice = (nearbyPub, itemsPrice) => {
  if (!nearbyPub) return null;
  if (nearbyPub.shipping?.available === false) return null;

  const freeFrom = +nearbyPub.shipping_free_delivery_price;

  if (freeFrom > 0 && itemsPrice >= freeFrom) return 0;

  return +nearbyPub.shipping_price || 0;
};

// How much is missing for free delivery, or null when there is no such offer
// (or it is already reached)
export const getAmountLeftForFreeDelivery = (nearbyPub, itemsPrice) => {
  const freeFrom = +nearbyPub?.shipping_free_delivery_price;

  if (!freeFrom || freeFrom <= 0) return null;
  if (itemsPrice >= freeFrom) return null;

  return freeFrom - itemsPrice;
};

// Below this the pub does not take a delivery order at all. 0 = no minimum.
// It rides on the nearby-pubs entry and on /client/pub/id/{id}?lat&lng.
export const getMinOrderPrice = (nearbyPub) =>
  +nearbyPub?.shipping_min_order_price || 0;

// How much is missing before the order can be placed, or null when there is
// no minimum (or it is already met). Since the server started refusing an
// order under the minimum with a 400, this is what has to be said *before*
// the client taps "order".
export const getAmountLeftForMinOrder = (nearbyPub, itemsPrice) => {
  const minOrderPrice = getMinOrderPrice(nearbyPub);

  if (minOrderPrice <= 0) return null;
  if (itemsPrice >= minOrderPrice) return null;

  return minOrderPrice - itemsPrice;
};
