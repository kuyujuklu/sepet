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

// Same schedule getPubWorkHours reads, but looks forward instead of just
// answering "open right now": the first day (starting today) with a real
// window, skipping today's own if it already ended. Powers the "you can
// still pre-order - opens {when} from {start} to {end}" messaging, which
// needs an actual answer even on a day the pub is closed all day (a
// {start:0,end:0} entry, not merely outside today's hours).
export const getNextOpenWindow = (pub) => {
  const week = pub?.shipping?.shipping_work_hours_for_week;
  if (!week || week.length !== 7) return null;

  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset < 7; offset++) {
    const dayIndex = (todayIndex + offset) % 7;
    const window = week[dayIndex];
    if (!window || window.start === undefined || window.end === undefined || window.end <= window.start) continue;
    if (offset === 0 && nowMinutes >= window.end) continue;

    return { daysFromNow: offset, start: window.start, end: window.end };
  }

  return null;
};

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
