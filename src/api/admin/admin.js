import { createApi } from '@reduxjs/toolkit/query/react';
import { authenticationBasedQuery } from '../auth/authBasedQuery';

export const admin = createApi({
    reducerPath: 'adminQuery',
    baseQuery: authenticationBasedQuery,
    tagTypes: ['Orders'],
    endpoints: (builder) => ({
        getAllOrders: builder.query({
            query: ({status}) => `/api/admin/orders?status=${status}`,
            providesTags: ['Orders']
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
    }),
    
})

export const { useGetAllOrdersQuery, useGetPubRefreshTokenQuery, useLazyGetAllOrdersQuery, useLazyGetPubRefreshTokenQuery } = admin;