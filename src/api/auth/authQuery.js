import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const auth = createApi({
    reducerPath: 'authQuery',
    baseQuery: fetchBaseQuery({
        baseUrl: "/api/"
    }),
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        registrate: builder.query({
            query: ({data}) => ({
                url: `/company`,
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            invalidatesTags: ['Company'],
        }),
        registrateCourier: builder.query({
            query: ({data}) => ({
                url: `/courier/register`,
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
        }),
        authenticate: builder.query({
            query: ({data}) => ({
                url: `/auth/login`,
                method: 'POST',
                body: {as: "", email: data.email, password: data.password},
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            invalidatesTags: ['Company'],
        }),
        logout: builder.query({
            query: () => ({
                url: `/auth/logout`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            invalidatesTags: ['Company'],
        }),
    }),
})

export const { useLazyRegistrateQuery, useLazyRegistrateCourierQuery, useLazyAuthenticateQuery, useLazyLogoutQuery } = auth;