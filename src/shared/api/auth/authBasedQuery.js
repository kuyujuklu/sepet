import uuid from "react-native-uuid";
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { refreshToken } from "./refreshToken";
import { convertRespError } from "../../../app/errors/convertApiErrors";
import { appErrors } from "../../../app/errors/appErrors";

export let accesstoken = "";

export const setaccesstoken = (token) => {
    accesstoken = token;
};

export const authenticationBasedQuery = async (args, api, extraOptions) => {
    const requestID = uuid.v4();
    console.log("api url: ", process.env.EXPO_PUBLIC_API_URL)
    const resp = await fetchBaseQuery({
        baseUrl: process.env.EXPO_PUBLIC_API_URL,
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
            resp.error.unauthorized = true;
            break;
        }
        case "PARSING_ERROR": {
            resp.error.text = getParsingErrorText(resp)
            break;
        }
        case "FETCH_ERROR": {
            resp.error.text = "network error"
            break;
        }
        default:
            resp.error.text = convertRespError(resp.error.data?.err);
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
