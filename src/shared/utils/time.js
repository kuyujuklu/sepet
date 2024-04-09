export const GetTimeFromApiTimeString = (timeString) => {
    const rawDate = new Date(timeString);
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

export const ConvertApiTimeToLocal = (time, lang) => {
    const locale = lang === "ro" ? "ro-RO" : "ru-RU";
    const date = GetTimeFromApiTimeString(time)

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
    const date = GetTimeFromApiTimeString(time)

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
}