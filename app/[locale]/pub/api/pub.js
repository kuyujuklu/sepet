let reqNum = 0;

let API_SERV = process.env.API_SERV || "qrcodesapi";

export const getPubInfo = async (id) => {
    console.log(`made request to ${API_SERV}/api/client/pub/id`, reqNum++);

    const res = await fetch(`http://${API_SERV}/api/client/pub/${id}`,
        {next: { revalidate: 0 }}
    ).catch((err) => console.log(err));

    // A non-existent/expired pub id (a bad link, a removed pub) 404s with a
    // valid JSON body (e.g. {"err":"pub not found","ok":false}) - treating
    // that as real data left `data.pub` undefined further down with nothing
    // catching it, so the page just rendered blank instead of the
    // SomethingWentWrong screen every other "no data" path already shows.
    if (!res || !res.ok) {
        console.log("no data error ==============================");
        return null;
    }

    let data = null;
    try {
        data = await res.json().catch((err) => console.log(err));
    } catch(e) {
        let rawData = await res?.text().catch(err => console.log(err));
        console.log("rawData", rawData);
    }

    if (!data)
    {
        console.log("no data error ==============================");
    }


    console.log("data: ", data)

    return data;
};
