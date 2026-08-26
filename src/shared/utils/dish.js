import { currencies, deliveryTypes } from "../../app/static-data/data";

export const getCurrencySymbol = (currencyID) =>
  currencies.find((currency) => currency.id === currencyID)?.symbol ?? "Lei";

// Pubs that deliver with a delivery service may include the commission
// into the price the client sees
export const getPubCommission = (pub) => {
  const shouldAddCommission =
    pub?.shipping?.delivery_type === deliveryTypes.deliveryService &&
    pub?.shipping?.add_commission_to_dish_prices;

  if (!shouldAddCommission) return 0;

  return +pub?.shipping?.commission_for_dish_prices || 0;
};

export const addCommissionToPrice = (price, commission) =>
  price + (price / 100) * commission;

export const hasDiscount = (dish) =>
  !!dish?.sale_price && +dish.sale_price > 0 && +dish.sale_price < +dish.price;

export const getDiscountPercent = (dish) => {
  if (!hasDiscount(dish)) return 0;

  return Math.round(((+dish.price - +dish.sale_price) / +dish.price) * 100);
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
