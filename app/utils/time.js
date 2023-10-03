export const ConvertQrMenuApiTimeToLocal = (time, lang) => {
    const locale = lang === "ro" ? "ro-RO" : "ru-RU";
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
