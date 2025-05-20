import { deliveryTypes } from "../static-data/data";

export const getPubWorkHours = (pub) => {
  const now = new Date();
  const currentDayTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  const currentDayNumber = (new Date().getDay() + 6) % 7 //converting to get monday = 0, sunday = 6 because idite nahuy
  if (pub?.shipping?.shipping_work_hours_for_week?.length !== 7) {
    return {
      isDeliveryAvailable: false,
      shippingWorkStart: 0,
      shippingWorkEnd: 1,
    }
  }
  const shippingWorkHoursForCurrentDay = pub.shipping.shipping_work_hours_for_week[currentDayNumber]

  if (shippingWorkHoursForCurrentDay?.start === undefined || shippingWorkHoursForCurrentDay?.end === undefined) {
    return {
      isDeliveryAvailable: false,
      shippingWorkStart: 0,
      shippingWorkEnd: 1,
    }
  }

  const isDeliveryAvailable =
    pub.shipping.available &&
    currentDayTimeInMinutes >= shippingWorkHoursForCurrentDay.start &&
    currentDayTimeInMinutes < shippingWorkHoursForCurrentDay.end


  return {
    isDeliveryAvailable,
    shippingWorkStart: shippingWorkHoursForCurrentDay.start,
    shippingWorkEnd: shippingWorkHoursForCurrentDay.end,
  };
}

export const countCommissionForPub = (pub) => {
  const shouldAddCommission =
    pub?.shipping?.delivery_type === deliveryTypes.deliveryService &&
    pub?.shipping?.add_commission_to_dish_prices;

  const commission = shouldAddCommission
    ? pub?.shipping?.commission_for_dish_prices
    : 0;


  return commission
}
