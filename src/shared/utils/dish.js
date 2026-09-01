import { currencies, deliveryTypes } from "../../app/static-data/data";
import { ENV } from "../../constants/env/env";

export const getCurrencySymbol = (currencyID) =>
  currencies.find((currency) => currency.id === currencyID)?.symbol ?? "Lei";

// Pubs that deliver with a delivery service may include the commission
// into the price the client sees.
//
// Two shapes reach this: the full pub of pub-info, which nests its shipping
// settings under `shipping`, and the pub summary embedded next to every dish
// of the aggregated feed, which is flat. Reading both here keeps every price
// on every screen coming out of one function.
export const getPubCommission = (pub) => {
  const deliveryType = pub?.shipping?.delivery_type ?? pub?.delivery_type;
  const addsCommission =
    pub?.shipping?.add_commission_to_dish_prices ??
    pub?.add_commission_to_dish_prices;

  if (deliveryType !== deliveryTypes.deliveryService || !addsCommission) {
    return 0;
  }

  return (
    +(pub?.shipping?.commission_for_dish_prices ??
      pub?.commission_for_dish_prices) || 0
  );
};

export const addCommissionToPrice = (price, commission) =>
  price + (price / 100) * commission;

export const hasDiscount = (dish) =>
  !!dish?.sale_price && +dish.sale_price > 0 && +dish.sale_price < +dish.price;

export const getDiscountPercent = (dish) => {
  if (!hasDiscount(dish)) return 0;

  return Math.round(((+dish.price - +dish.sale_price) / +dish.price) * 100);
};

// The stop list. A dish from before the field existed has no `available` at
// all, and that has to read as "in stock" - otherwise every older menu would
// go grey at once.
export const isDishAvailable = (dish) => dish?.available !== false;

// The photo of a dish. `image_thumb_file_name` is generated on upload and is
// what a grid should ask for - the feed used to download full-size photos for
// 130px cards. It is empty when the original was already small enough or its
// format could not be decoded, hence the fallback.
export const getDishImagePath = (dish, { full = false } = {}) => {
  const fileName = full
    ? dish?.image_file_name
    : dish?.image_thumb_file_name || dish?.image_file_name;

  if (!fileName) return null;

  return `${ENV.API_HTTP_URL}${ENV.API_STATIC_PATH}/images/dishes/${fileName}`;
};

export const formatPrice = (price) => {
  if (isNaN(+price)) return "0";

  return String(Math.round(+price * 100) / 100);
};

// Everything a dish card needs to show prices: the price the client pays,
// the crossed out one (only when the dish is on sale) and the currency
export const getDishPrices = (dish, pub) => {
  const commission = getPubCommission(pub);
  const isOnSale = hasDiscount(dish);
  const priceToPay = isOnSale ? +dish.sale_price : +dish.price;

  return {
    commission,
    isOnSale,
    discountPercent: getDiscountPercent(dish),
    currency: getCurrencySymbol(pub?.currency_id),
    price: addCommissionToPrice(priceToPay, commission),
    oldPrice: isOnSale ? addCommissionToPrice(+dish.price, commission) : null,
    // The basket keeps prices without the commission (see basketSlice)
    basketPrice: priceToPay,
  };
};
