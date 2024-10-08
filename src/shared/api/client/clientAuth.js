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
    generateRegistrationSession: builder.query({
      query: ({ phone, password, name }) => ({
        url: `/client/registration/generate-phone-validation-session`,
        method: "POST",
        body: {
          phone,
          name: name,
          password,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    validateRegistrationNumber: builder.query({
      query: ({ phone, number }) => ({
        url: `/client/registration/registrate-by-session-number`,
        method: "POST",
        body: {
          phone,
          number: number,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    generateChangePasswordSession: builder.query({
      query: ({ phone }) => ({
        url: `/client/auth/generate-change-password-validation-session`,
        method: "POST",
        body: {
          phone,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    checkValidationNumbers: builder.query({
      query: ({ phone, number }) => ({
        url: `/client/auth/check-validation-number`,
        method: "POST",
        body: {
          phone,
          number: number
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    changePasswordWithValidationNumber: builder.query({
      query: ({ phone, number, password }) => ({
        url: `/client/auth/change-password-with-validation-number`,
        method: "POST",
        body: {
          phone,
          number: number,
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
  useLazyGenerateRegistrationSessionQuery,
  useLazyValidateRegistrationNumberQuery,
  useLazyChangePasswordWithValidationNumberQuery,
  useLazyCheckValidationNumbersQuery,
  useLazyGenerateChangePasswordSessionQuery
} = clientAuthApi;
