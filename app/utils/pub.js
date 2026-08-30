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
  console.log("PUB SHIPPING: ", pub?.shipping)

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

// Accepts either shape the API returns these fields in: nested under
// `shipping` on a full pub, flat on the pub summary the aggregated feed
// embeds next to every dish.
export const countCommissionForPub = (pub) => {
  const shipping = pub?.shipping ?? pub;

  const shouldAddCommission =
    shipping?.delivery_type === deliveryTypes.deliveryService &&
    shipping?.add_commission_to_dish_prices;

  const commission = shouldAddCommission
    ? shipping?.commission_for_dish_prices
    : 0;


  return commission ?? 0
}
