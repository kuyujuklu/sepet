import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ENV } from "../../../constants/env/env";

export const clientAuthApi = createApi({
  reducerPath: "clientAuthQuery",
  baseQuery: fetchBaseQuery({ baseUrl: ENV.API_HTTP_URL + "/api" }),
  tagTypes: ["Client"],
  endpoints: (builder) => ({
    registrate: builder.query({
      query: ({ phone, name, password }) => ({
        url: `/client/registration`,
        method: "POST",
        body: {
          phone,
          name,
          password,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    authentication: builder.query({
      query: ({ phone, password }) => ({
        url: `/client/authentication`,
        method: "POST",
        body: {
          phone,
          password,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const {
  useLazyRegistrateQuery,
  useLazyAuthenticationQuery,
} = clientAuthApi;
