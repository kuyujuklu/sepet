export const addCommissionToPrice = (price, commission) => {
  return price + (price / 100) * commission;
};

