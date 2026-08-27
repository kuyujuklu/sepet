// When a pub delivers, and whether it delivers *here*.
//
// The rule mirrors helpers.IsShippingWorkingNow on the server, so the `is_open`
// that rides on the feed's pub summary and the flag computed here from
// pub-info never contradict each other: the per-day work hours decide, they
// fall back to the single start/end pair, and a pub with neither configured
// counts as open.

const isInsideWorkTime = (minutesNow, start, end) => {
  if (start <= end) return minutesNow >= start && minutesNow < end;

  // Past midnight (e.g. 22:00 - 02:00)
  return minutesNow >= start || minutesNow < end;
};

// A day left at 0-0 (or ending at 0) was never filled in, so it is not a
// "closed all day" - it means "use the single pair instead"
const isConfiguredWorkTime = (day) =>
  !!day && day.start !== day.end && day.end !== 0;

export const getPubWorkHours = (pub) => {
  const shipping = pub?.shipping;

  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  // Converting to monday = 0, sunday = 6, which is how the week is stored
  const dayIndex = (now.getDay() + 6) % 7;

  // `available` is the delivery-zone answer, not an opening hour: on
  // /client/pub/id/{id}?lat&lng it is false when the pub does not deliver to
  // that point at all.
  const deliversHere = shipping?.available !== false;

  const week = shipping?.shipping_work_hours_for_week;
  const dayOfWeek = Array.isArray(week) && week.length === 7 ? week[dayIndex] : null;

  if (isConfiguredWorkTime(dayOfWeek)) {
    return {
      isDeliveryAvailable:
        deliversHere && isInsideWorkTime(minutesNow, dayOfWeek.start, dayOfWeek.end),
      isAvailableForDelivery: deliversHere,
      shippingWorkStart: dayOfWeek.start,
      shippingWorkEnd: dayOfWeek.end,
    };
  }

  const start = +shipping?.shipping_work_start || 0;
  const end = +shipping?.shipping_work_end || 0;

  return {
    isDeliveryAvailable:
      deliversHere && (start === end || isInsideWorkTime(minutesNow, start, end)),
    isAvailableForDelivery: deliversHere,
    shippingWorkStart: start,
    shippingWorkEnd: end,
  };
};
