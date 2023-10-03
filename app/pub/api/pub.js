let reqNum = 0;

let API_SERV = process.env.API_SERV || "qrcodesapi";

export const getPubInfo = async (id) => {
    console.log(`made request to ${API_SERV}`, reqNum++);

    const res = await fetch(`http://${API_SERV}/api/client/pub/${id}`, 
        {next: { revalidate: 0 }}
    ).catch((err) => console.log(err));

    
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

    return data;
};
