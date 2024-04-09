import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const clientAuthApi = createApi({
    reducerPath: "clientAuthQuery",
    baseQuery: fetchBaseQuery({baseUrl: process.env.EXPO_PUBLIC_API_URL + "/api"}),
    tagTypes: ["Client"],
    endpoints: (builder) => ({
        registrate: builder.query({
            query: ({phone, name}) => ({
                url: `/client/registration`,
                method: 'POST',
                body: {
                    phone: phone,
                    name: name
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
        }),
        createAuthenticationSession: builder.query({
            query: ({phone}) => ({
                url: `/client/authentication`,
                method: 'POST',
                body: {
                    phone: phone,
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
        }),
        validateRegistration: builder.query({
            query: ({phone, validationNumber}) => ({
                url: `/client/registration/validation`,
                method: 'POST',
                body: {
                    phone: phone,
                    validation_number: validationNumber
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            keepUnusedDataFor: 0.01
        }),
        validateAuthentication: builder.query({
            query: ({phone, validationNumber}) => ({
                url: `/client/authentication/validation`,
                method: 'POST',
                body: {
                    phone: phone,
                    validation_number: validationNumber
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            keepUnusedDataFor: 0.01
        }),
    }),
});

export const {
    useLazyRegistrateQuery,
    useLazyValidateRegistrationQuery,
    useLazyCreateAuthenticationSessionQuery,
    useLazyValidateAuthenticationQuery
} = clientAuthApi;