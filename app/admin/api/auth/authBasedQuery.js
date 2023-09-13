"use client"

import { v4 as uuid } from "uuid";
import { fetchBaseQuery } from "@reduxjs/toolkit/dist/query";
import { refreshToken } from "./refreshToken";
import { convertRespError } from "../resperrors/convertRespError";
import { appErrors } from "../../errors/errors";

export let accesstoken =
"";
console.log("sending request token: ", accesstoken);

export const setaccesstoken = (token) => {
  console.log("settingToken ", token);
  accesstoken = token;
};

export const authenticationBasedQuery = async (args, api, extraOptions) => {
  console.log("sending request token: ", accesstoken);
  const requestID = uuid();
  const resp = await fetchBaseQuery({
    baseUrl: "/",
    prepareHeaders: (headers) => {
      headers.set("accesstoken", `${accesstoken}`);
      return headers;
    },
  })(args, api, extraOptions);


  if(resp.error) {
    switch(resp.error.status) {
        case 401: {
            let res = await refreshToken();
            if (res.ok) {
                console.log("refreshed token: ", res.accesstoken);
                accesstoken = res.accesstoken;
                setaccesstoken(res.accesstoken);
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
