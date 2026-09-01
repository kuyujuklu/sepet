export const GetTimeFromApiTimeString = (timeString) => {
  const rawDate = new Date(timeString);
  const date = new Date(
    Date.UTC(
      rawDate.getFullYear(),
      rawDate.getMonth(),
      rawDate.getDate(),
      rawDate.getHours(),
      rawDate.getMinutes(),
      rawDate.getSeconds(),
    ),
  );

  return date;
};

export const ConvertApiTimeToLocal = (time, lang) => {
  const locale = lang === "ro" ? "ro-RO" : "ru-RU";
  const date = GetTimeFromApiTimeString(time);

  const year = date.getFullYear();

  let month;
  month = date.toLocaleDateString(locale, { month: "short" });
  // if (locale === "ro-RO")
  //     month = date.toLocaleDateString(locale, { month: "short" });

  //Capitalize first letter and remove dot at the end
  month = month.charAt(0).toUpperCase() + month.slice(1, -1);
  month = month === "Ма" ? "Мая" : month;

  const day = date.getDate();
  const hours = date.getHours();

  let minutes = date.getMinutes();
  //Add leading zero if minutes < 10
  let minutesStr = (minutes < 10 ? "0" : "") + minutes;

  return `${day} ${month} ${year} ${hours}:${minutesStr}`;
};

export const ConvertApiTimeToLocalDayMonthYear = (time, lang) => {
  const locale = lang === "ro" ? "ro-RO" : "ru-RU";
  const date = GetTimeFromApiTimeString(time);

  const year = date.getFullYear();

  let month;
  month = date.toLocaleDateString(locale, { month: "short" });
  // if (locale === "ro-RO")
  //     month = date.toLocaleDateString(locale, { month: "short" });

  //Capitalize first letter and remove dot at the end
  month = month.charAt(0).toUpperCase() + month.slice(1, -1);
  month = month === "Ма" ? "Мая" : month;

  const day = date.getDate();
  return `${day} ${month} ${year}`;
};

export const ConvertApiTimeToLocalDayMonth = (time, lang) => {
  const locale = lang === "ro" ? "ro-RO" : "ru-RU";
  const date = GetTimeFromApiTimeString(time);

  let month;
  month = date.toLocaleDateString(locale, { month: "short" });
  // if (locale === "ro-RO")
  //     month = date.toLocaleDateString(locale, { month: "short" });

  //Capitalize first letter and remove dot at the end
  month = month.charAt(0).toUpperCase() + month.slice(1, -1);
  month = month === "Ма" ? "Мая" : month;

  const day = date.getDate();
  return `${day} ${month}`;
};

export const GetShippingTimeString = (shippingHours) => {
  const startRoundedHours = parseInt(shippingHours.start / 60);
  const startRoundedMinutes = parseInt(shippingHours.start % 60);
  const endRoundedHours = parseInt(shippingHours.end / 60);
  const endRoundedMinutes = parseInt(shippingHours.end % 60);

  const shippingTimeString = `${
    startRoundedHours > 9 ? startRoundedHours : "0" + startRoundedHours
  }:${
    startRoundedMinutes > 9 ? startRoundedMinutes : "0" + startRoundedMinutes
  } - ${endRoundedHours > 9 ? endRoundedHours : "0" + endRoundedHours}:${
    endRoundedMinutes > 9 ? endRoundedMinutes : "0" + endRoundedMinutes
  }`;

  return shippingTimeString;
};

// Just the clock time of an api timestamp - what a timeline row needs next to
// its status ("Готовится · 14:32"); the date is already at the top of the
// screen, repeating it on every step is noise.
export const ConvertApiTimeToLocalHoursMinutes = (time) => {
  const date = GetTimeFromApiTimeString(time);

  if (isNaN(date.getTime())) return "";

  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
};
