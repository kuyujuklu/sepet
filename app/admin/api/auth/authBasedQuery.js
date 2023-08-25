import { v4 as uuid } from "uuid";
import { fetchBaseQuery } from "@reduxjs/toolkit/dist/query";
import { refreshToken } from "./refreshToken";
import { convertRespError } from "../resperrors/convertRespError";
import { appErrors } from "../../errors/errors";

export let access_token =
  "";

export const setAccessToken = (token) => {
  access_token = token;
};

export const authenticationBasedQuery = async (args, api, extraOptions) => {
  const requestID = uuid();
  const resp = await fetchBaseQuery({
    baseUrl: "/",
    prepareHeaders: (headers) => {
      headers.set("access_token", `${access_token}`);
      return headers;
    },
  })(args, api, extraOptions);


  if(resp.error) {
    switch(resp.error.status) {
        case 401: {
            let res = await refreshToken();
            if (res.ok) {
                access_token = res.access_token;
                return await authenticationBasedQuery(args, api, extraOptions);
            }
            
            resp.error.text = appErrors.unauthorized;
            break;
        }
        default: {
            resp.error.text = convertRespError(resp.error.data.err);
        }
    }
  }

  return {
    ...resp,
    meta: resp.meta && { ...resp.meta, requestID },
  };

};
