import { appErrors } from "../../errors/errors";
import { convertRespError } from "../resperrors/convertRespError";

export const refreshToken = async () => {
    const resp = await fetch("/api/auth/refresh-token", {
        method: "POST",
        credentials: "include"
    }).catch((err) => {
        console.log(err);
    });

    let err;
    const body = await resp.json().catch((e) => {
        err = e;
    });
    if(err || !body) {
        return {
            ok: false,
            err: appErrors.something_went_wrong
        }
    }

    if(body.ok) {
        return {
            ok: true,
            accesstoken: body.accesstoken
        };
    }

    if(!body.ok) {
        return {
            ok: false, 
            err: convertRespError(body.err)
        }
    }
}