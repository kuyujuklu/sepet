import { createApi } from "@reduxjs/toolkit/dist/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

export const pub = createApi({
    reducerPath: "pubQuery",
    baseQuery: authenticationBasedQuery,
    tagTypes: ["Pub", "Shipping", "Preorder"],
    endpoints: (builder) => ({
        createPub: builder.mutation({
            query: ({ companyID, data }) => ({
                url: `/api/company/${companyID}/pubs/`,
                method: "POST",
                body: {
                    name: data.name,
                    url_name: data.urlName,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Pub"],
        }),
        updatePub: builder.mutation({
            query: ({ companyID, data, pubID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/`,
                method: "PUT",
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
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Pub"],
        }),
        deletePub: builder.mutation({
            query: ({ companyID, pubID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/`,
                method: "Delete",
            }),
            invalidatesTags: ["Pub"],
        }),
        getPubs: builder.query({
            query: ({ companyID }) => ({
                url: `/api/company/${companyID}/pubs/`,
                method: "GET",
            }),
            providesTags: ["Pub"],
        }),
        getPub: builder.query({
            query: ({ companyID, pubID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/`,
                method: "GET",
            }),
            providesTags: ["Pub"],
        }),
        getFullPubInfo: builder.query({
            query: ({ pubID }) => ({
                url: `/api/client/pub/${pubID}/`,
                method: "GET",
            }),
            providesTags: ["Pub"],
        }),
        uploadPubBG: builder.mutation({
            query: ({ companyID, pubID, data }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/bg`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Pub"],
        }),
        getShipping: builder.query({
            query: ({ pubID }) => ({
                url: `/api/client/pub/${pubID}/shipping`,
                method: "GET",
            }),
            providesTags: ["Pub", "Shipping"],
        }),
        setShipping: builder.mutation({
            query: ({ companyID, shapes, pubID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/shipping`,
                method: "POST",
                body: {
                    shapes
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Shipping"],
        }),
        setShippingAvailability: builder.mutation({
            query: ({ companyID, pubID, available }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/shipping-availability`,
                method: "POST",
                body: {
                    available: available
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Shipping"],
        }),
        getPreorder: builder.query({
            query: ({ pubID }) => ({
                url: `/api/client/pub/${pubID}/preorder`,
                method: "GET",
            }),
            providesTags: ["Pub", "Preorder"],
        }),
        setPreorder: builder.mutation({
            query: ({ companyID, preorder, pubID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/preorder`,
                method: "POST",
                body: {
                    "card_preorder": preorder.cardPreorder,
                    "cash_preorder": preorder.cashPreorder
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Preorder"],
        }),
    }),
});

export const {
    useGetPubsQuery,
    useCreatePubMutation,
    useUpdatePubMutation,
    useDeletePubMutation,
    useGetPubQuery,
    useGetFullPubInfoQuery,
    useUploadPubBGMutation,
    useGetShippingQuery,
    useSetShippingMutation,
    useSetShippingAvailabilityMutation,
    useGetPreorderQuery,
    useSetPreorderMutation,
} = pub;
