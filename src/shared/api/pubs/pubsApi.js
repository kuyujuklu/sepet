import { createApi } from '@reduxjs/toolkit/query/react'
import { authenticationBasedQuery } from '../auth/authBasedQuery';

export const pubsApi = createApi({
    reducerPath: "pubsQuery",
    baseQuery: authenticationBasedQuery,
    tagTypes: ["Pubs"],
    endpoints: (builder) => ({
        getNearbyPubs: builder.query({
            query: ({coords}) => ({
                url: `/api/client/get-available-pubs?lat=${coords?.lat}&lng=${coords?.lng}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
        }),
        getPubInfo: builder.query({
            query: ({pubID}) => ({
                url: `/api/client/pub/id/${pubID}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
        }),
    }),
});

export const {
    useGetNearbyPubsQuery,
    useLazyGetNearbyPubsQuery,
    useGetPubInfoQuery,
    useLazyGetPubInfoQuery,
} = pubsApi;