import { v4 as uuid } from "uuid";
import { refreshToken } from "./refreshToken";
import { convertRespError } from "../resperrors/convertRespError";
import { appErrors } from "../../errors/errors";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export let accesstoken = "";

export const setaccesstoken = (token) => {
    accesstoken = token;
};

export const authenticationBasedQuery = async (args, api, extraOptions) => {
    const requestID = uuid();
    const resp = await fetchBaseQuery({
        baseUrl: "/",
        prepareHeaders: (headers) => {
            headers.set("accesstoken", `${accesstoken}`);
            return headers;
        },
    })(args, api, extraOptions);

    if (!resp.error) {
        return {
            ...resp,
            meta: resp.meta && { ...resp.meta, requestID },
        };
    }

    switch (resp.error.status) {
        case 400: {
            resp.error.text = getBadRequestText(resp);
            break;
        }
        case 401: {
            let res = await refreshToken();
            if (res.ok) {
                accesstoken = res.accesstoken;
                setaccesstoken(res.accesstoken);
                return await authenticationBasedQuery(args, api, extraOptions);
            }

            resp.error.text = appErrors.unauthorized;
            break;
        }
        case "PARSING_ERROR": {
            resp.error.text = getParsingErrorText(resp)
            break;
        }
        default:
            resp.error.text = convertRespError(resp.error.data.err);
    }

    return {
        ...resp,
        meta: resp.meta && { ...resp.meta, requestID },
    };
};

function getParsingErrorText(resp) {
    if (resp.error.originalStatus === 413)
        return appErrors.fileIsTooLarge;
    return appErrors.unknown_error
}

function getBadRequestText(resp) {
    if (resp.error.data.err === "invalid file extension")
        return appErrors.invalidFileExtension;

    return appErrors.validationError;
}
