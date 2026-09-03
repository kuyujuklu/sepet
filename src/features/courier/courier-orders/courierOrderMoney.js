// Shared "what does the courier pay/collect/earn" math for one order - used
// by both the compact list card and the order detail page so the two never
// drift apart. `pubDishes` is the pub's full dish list (from
// useGetFullPubInfoQuery), needed to resolve names for order.dishes.
export const getShownDishes = (order, pubDishes) => {
  if (!pubDishes || !order?.dishes) return [];

  const pubDishesMap = new Map();
  for (const dish of pubDishes) {
    pubDishesMap.set(dish.id, dish);
  }

  const shownDishes = [];
  for (const orderDish of order.dishes) {
    const pubDish = pubDishesMap.get(orderDish.dish_id);
    if (!pubDish) continue;
    shownDishes.push({ order_dish: orderDish, pub_dish: pubDish });
  }
  return shownDishes;
};

// `courier_reward` is the courier's actual earning on the order - the flat
// delivery fee they're paid. `courier_debit` is a separate balance-adjustment
// figure (what gets subtracted from their account balance on reserve, see
// AddOrderCourierDebitToCourier on the backend) - NOT the same number, and
// not shown here (the original card had it commented out as unfinished).
export const getCourierOrderMoney = (order, shownDishes) => {
  const productsPrice = (shownDishes ?? []).reduce(
    (acc, { order_dish }) => acc + order_dish.count * order_dish.dish_price,
    0
  );

  const totalFromClient = (order?.delivery_price ?? 0) + productsPrice;
  const productsPriceWithoutCommission = order?.total_dishes_price_without_commission ?? 0;
  const courierReward = order?.courier_info?.courier_reward ?? 0;

  return { totalFromClient, productsPriceWithoutCommission, courierReward };
};
