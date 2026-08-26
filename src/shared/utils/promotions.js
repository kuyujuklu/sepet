import { currencies, promotionTypes } from "../../app/static-data/data";

const getCurrencySymbol = (currencyID) =>
  currencies.find((currency) => currency.id === currencyID)?.symbol ?? "Lei";

// Backend may send dates as unix seconds, unix ms or as a date string
const toDate = (value) => {
  if (!value) return null;

  if (typeof value === "number") {
    const ms = value < 1e11 ? value * 1000 : value;
    return new Date(ms);
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) return null;

  return date;
};

export const isPromotionActive = (promotion, now = new Date()) => {
  if (!promotion) return false;
  if (promotion.visible === false) return false;

  const start = toDate(promotion.start_date);
  const end = toDate(promotion.end_date);

  if (start && now < start) return false;
  if (end && now > end) return false;

  return true;
};

// Short text for the colored badge on the promotion image ("-20%", "3+1")
export const getPromotionBadge = (promotion) => {
  if (!promotion) return "";

  switch (promotion.type) {
    case promotionTypes.discount: {
      const percent = getDiscountPercent(promotion);
      if (!percent) return "%";
      return `-${percent}%`;
    }
    case promotionTypes.giftForCount:
      return `${promotion.required_count}+${promotion.gift_count || 1}`;
    case promotionTypes.nPlusM:
      return `${promotion.required_count}+${promotion.gift_count || 1}`;
    case promotionTypes.freeDelivery:
      return "0 Lei";
    default:
      return "%";
  }
};

export const getDiscountPercent = (promotion) => {
  if (!promotion) return 0;

  if (!isNaN(+promotion.discount_percent) && +promotion.discount_percent > 0) {
    return Math.round(+promotion.discount_percent);
  }

  const price = +promotion.price;
  const salePrice = +promotion.sale_price;

  if (isNaN(price) || isNaN(salePrice)) return 0;
  if (price <= 0 || salePrice <= 0 || salePrice >= price) return 0;

  return Math.round(((price - salePrice) / price) * 100);
};

// Main line of the promotion card, built from the type and the fields
// the restaurant filled in ("-20% на Шаурму", "3 шаурмы — кола в подарок")
export const getPromotionTitle = (t, promotion) => {
  if (!promotion) return "";

  //Restaurant wrote its own title - always prefer it
  if (promotion.title) return promotion.title;

  const currency = getCurrencySymbol(promotion.currency_id);
  const dish = promotion.dish_name ?? t("promotions.default_dish_name");

  switch (promotion.type) {
    case promotionTypes.discount: {
      const percent = getDiscountPercent(promotion);

      if (percent > 0) {
        return t("promotions.discount_on_dish", { percent, dish });
      }

      if (!isNaN(+promotion.sale_price) && +promotion.sale_price > 0) {
        return t("promotions.dish_for_price", {
          dish,
          price: +promotion.sale_price,
          currency,
        });
      }

      return dish;
    }
    case promotionTypes.giftForCount:
      return t("promotions.gift_for_count", {
        dish_count: promotion.required_count,
        dish,
        gift: promotion.gift_name ?? t("promotions.default_gift_name"),
      });
    case promotionTypes.nPlusM:
      return t("promotions.n_plus_m", {
        dish_count: promotion.required_count,
        gift_count: promotion.gift_count || 1,
        dish,
      });
    case promotionTypes.freeDelivery:
      return t("promotions.free_delivery_from", {
        price: +promotion.min_order_price || 0,
        currency,
      });
    default:
      return promotion.description ?? "";
  }
};

// Secondary line - restaurant`s own comment or the promotion end date
export const getPromotionSubtitle = (t, promotion) => {
  if (!promotion) return "";
  if (promotion.description) return promotion.description;

  const end = toDate(promotion.end_date);
  if (!end) return "";

  return t("promotions.active_until", {
    date: end.toLocaleDateString(),
  });
};
