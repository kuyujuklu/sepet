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
  return date;
};

export const formatDate = (date) => {
  // Get date and time components

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so we add 1
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  // Combine the components into the desired format
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const ConvertQrMenuApiTimeToLocal = (time, lang) => {
  const locale = lang === "ro" ? "ro-RO" : "ru-RU";
  const date = GetUtcDateFromApiTime(time);

  const year = date.getFullYear();

  let month;
  month = date.toLocaleDateString(locale, { month: "short" });

  //Capitalize first letter and remove dot at the end
  month = month.charAt(0).toUpperCase() + month.slice(1, -1);
  month = month === "Ма" /*russian symbols*/ ? "Мая" : month;
  month = month === "Ma" /*latin symbols*/ ? "Mai" : month;

  const day = date.getDate();
  const hours = date.getHours();

  let minutes = date.getMinutes();
  //Add leading zero if minutes < 10
  let minutesStr = (minutes < 10 ? "0" : "") + minutes;

  return `${day} ${month} ${year} ${hours}:${minutesStr}`;
};
