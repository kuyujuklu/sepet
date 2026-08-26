import { getPubCommission } from "./dish";

// The money math of the basket, in one place.
//
// It used to be copy-pasted in three components (basket page, floating bar,
// checkout page) and they drifted: the commission is rounded up *per dish*, so
// summing first and rounding later gives a different number.
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
// free-delivery threshold live there, not on the pub of pub-info.
export const getDeliveryPrice = (nearbyPub, itemsPrice) => {
  if (!nearbyPub) return null;

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
