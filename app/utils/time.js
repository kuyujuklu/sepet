export const GetUtcDateFromApiTime = (time) => {
  const rawDate = new Date(time);
  const date = new Date(
    Date.UTC(
      rawDate.getFullYear(),
      rawDate.getMonth(),
      rawDate.getDate(),
      rawDate.getHours(),
      rawDate.getMinutes(),
      rawDate.getSeconds()
    )
  );
  return date
}

export const ConvertQrMenuApiTimeToLocal = (time, lang) => {
  const locale = lang === "ro" ? "ro-RO" : "ru-RU";
  const date = GetUtcDateFromApiTime(time)

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

export const convertMinsToTime = (minutes) => {
  let hours = Math.floor(minutes / 60);
  let remainingMinutes = minutes % 60;

  // Pad the minutes with a leading zero if needed
  let formattedMinutes = String(remainingMinutes).padStart(2, '0');

  return `${hours}:${formattedMinutes}`;
}

// Just the clock part of an API timestamp, for the delivery window the server
// puts on an order (estimated_delivery_time_from/to). Same UTC handling as
// ConvertQrMenuApiTimeToLocal - the API sends UTC without a zone marker.
export const ConvertQrMenuApiTimeToLocalClock = (time) => {
  if (!time) return null;

  const date = GetUtcDateFromApiTime(time);
  if (isNaN(date.getTime())) return null;

  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
};
