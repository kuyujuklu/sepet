import axios from "axios";

let reqNum = 0;
let apiServ = process.env.API_SERV;

export const getPubInfo = async (id) => {
    console.log(`made request to ${apiServ}`, reqNum++);

    const res = await axios.get(`http://qrcodesapi/api/client/pub/${id}`, {
        next: { revalidate: 0 },
    }).catch((err) => console.log(err));
    const data = await res.json().catch((err) => console.log(err));

    if (!data) console.log("no data error ==============================");
    else console.log("data", data);

    return data;
};
