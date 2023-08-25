import { createApi } from "@reduxjs/toolkit/dist/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

export const pub = createApi({
    reducerPath: 'pubQuery',
    baseQuery: authenticationBasedQuery,
    tagTypes: ['Pub'],
    endpoints: (builder) => ({
        createPub: builder.mutation({
            query: ({companyID, data}) => ({
                url: `/api/company/${companyID}/pubs/`,
                method: 'POST',
                body: {
                    name: data.name,
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            invalidatesTags: ['Pub']
        }),
        updatePub: builder.mutation({
            query: ({companyID, data, pubID}) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/`,
                method: 'PUT',
                body: {
                    name: data.name,
                    color_theme: data.colorTheme,
                    color: data.color,
                    wifi_password: data.wifiPassword,
                    address: data.address,
                    additional_info: data.additionalInfo,
                    currency_id: data.currencyID,
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            invalidatesTags: ['Pub']
        }),
        deletePub: builder.mutation({
            query: ({companyID, pubID}) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/`,
                method: 'Delete',
            }),
            invalidatesTags: ['Pub']
        }),
        getPubs: builder.query({
            query: ({companyID}) => ({
                url: `/api/company/${companyID}/pubs/`,
                method: 'GET',
            }),
            providesTags: ['Pub']
        }),
        getPub: builder.query({
            query: ({companyID, pubID}) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/`,
                method: 'GET',
            }),
            providesTags: ['Pub']
        }),
    }),
    
})

export const { useGetPubsQuery, useCreatePubMutation, useUpdatePubMutation, useDeletePubMutation, useGetPubQuery } = pub;