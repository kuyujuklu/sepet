import { v4 as uuid } from "uuid";
import { refreshToken } from "./refreshToken";
import { convertRespError } from "../resperrors/convertRespError";
import { appErrors } from "../../errors/errors";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// accesstoken used to live only in this module-level variable, reset to ""
// on every page load - meaning every reload logged the user out, even right
// after signing in. Persisting it here (the one place every caller already
// goes through to change it) fixes that for all six call sites at once
// without touching any of them.
const ACCESS_TOKEN_STORAGE_KEY = "accesstoken";

export let accesstoken = "";
try {
    accesstoken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || "";
} catch (e) {
    // localStorage unavailable (private mode, etc.) - falls back to the
    // pre-existing behavior of starting logged out.
}

export const setaccesstoken = (token) => {
    accesstoken = token;
    try {
        if (token) {
            localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
        } else {
            localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        }
    } catch (e) {
        // ignored - in-memory token still works for the rest of this session
    }
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
