export const addCommissionToPrice = (price, commission) => {
  return price + (price / 100) * commission;
};

// {dishID: {count}} + the pub's full dish list -> total price of everything
// currently in the basket, sale-price-aware, with the pub's commission
// applied the same way CreateOrderPopup used to compute it inline - shared
// now so the floating cart button and the checkout page agree on one number.
export const computeBasketSubtotal = (basketDishes, pubDishes, commission) => {
  if (!basketDishes || !pubDishes) return 0;

  const prices = {};
  pubDishes.forEach((dish) => {
    prices[dish.id] = dish.sale_price && dish.sale_price < dish.price ? dish.sale_price : dish.price;
  });

  let amount = 0;
  for (const dishID of Object.keys(basketDishes)) {
    const count = basketDishes[dishID]?.count ?? 0;
    if (!count || !prices[dishID]) continue;
    amount += prices[dishID] * count;
  }

  return addCommissionToPrice(amount, commission ?? 0);
};
