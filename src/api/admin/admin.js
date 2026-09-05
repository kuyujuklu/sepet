import { createApi } from '@reduxjs/toolkit/query/react';
import { authenticationBasedQuery } from '../auth/authBasedQuery';

export const admin = createApi({
    reducerPath: 'adminQuery',
    baseQuery: authenticationBasedQuery,
    tagTypes: ['Orders', 'Pubs', 'ShippingCopyPresets', 'PushCampaigns'],
    endpoints: (builder) => ({
        getAllOrders: builder.query({
            query: ({status}) => `/api/admin/orders?status=${status}`,
            providesTags: ['Orders']
        }),
        getAllPubs: builder.query({
            query: () => `/api/admin/pubs`,
            providesTags: ['Pubs']
        }),
        getPubRefreshToken: builder.query({
            query: ({pubID}) => ({
                url: `/api/admin/get-pub-refresh-token?pubID=${pubID}`,
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },
            })
        }),
        getShippingCopyPresets: builder.query({
            query: () => `/api/admin/shipping-copy-presets`,
            providesTags: ['ShippingCopyPresets'],
        }),
        createShippingCopyPreset: builder.mutation({
            query: (preset) => ({
                url: `/api/admin/shipping-copy-presets`,
                method: "POST",
                body: preset,
            }),
            invalidatesTags: ['ShippingCopyPresets'],
        }),
        updateShippingCopyPreset: builder.mutation({
            query: ({ id, ...preset }) => ({
                url: `/api/admin/shipping-copy-presets/${id}`,
                method: "PUT",
                body: preset,
            }),
            invalidatesTags: ['ShippingCopyPresets'],
        }),
        markShippingCopyPresetApplied: builder.mutation({
            query: ({ id }) => ({
                url: `/api/admin/shipping-copy-presets/${id}/mark-applied`,
                method: "POST",
            }),
            invalidatesTags: ['ShippingCopyPresets'],
        }),
        deleteShippingCopyPreset: builder.mutation({
            query: ({ id }) => ({
                url: `/api/admin/shipping-copy-presets/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['ShippingCopyPresets'],
        }),

        getAllPushCampaigns: builder.query({
            query: () => `/api/admin/push-campaigns`,
            providesTags: ['PushCampaigns'],
        }),
        createPushCampaign: builder.mutation({
            query: (campaign) => ({
                url: `/api/admin/push-campaigns`,
                method: "POST",
                body: campaign,
            }),
            invalidatesTags: ['PushCampaigns'],
        }),
        getPushCampaignAudiencePreview: builder.query({
            query: ({ audienceType, pubID, inactiveDays }) =>
                `/api/admin/push-campaigns/audience-preview?audienceType=${audienceType}&pubID=${pubID || 0}&inactiveDays=${inactiveDays || 0}`,
        }),
        testSendPushCampaign: builder.mutation({
            query: (input) => ({
                url: `/api/admin/push-campaigns/test-send`,
                method: "POST",
                body: input,
            }),
        }),
        getSubscriberStats: builder.query({
            query: () => `/api/admin/push-campaigns/subscriber-stats`,
        }),
    }),

})

export const {
    useGetAllOrdersQuery,
    useGetAllPubsQuery,
    useGetPubRefreshTokenQuery,
    useLazyGetAllOrdersQuery,
    useLazyGetPubRefreshTokenQuery,
    useGetShippingCopyPresetsQuery,
    useCreateShippingCopyPresetMutation,
    useUpdateShippingCopyPresetMutation,
    useMarkShippingCopyPresetAppliedMutation,
    useDeleteShippingCopyPresetMutation,
    useGetAllPushCampaignsQuery,
    useCreatePushCampaignMutation,
    useLazyGetPushCampaignAudiencePreviewQuery,
    useTestSendPushCampaignMutation,
    useGetSubscriberStatsQuery,
} = admin;