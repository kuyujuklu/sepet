import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

export const orders = createApi({
    reducerPath: "ordersQuery",
    baseQuery: authenticationBasedQuery,
    tagTypes: ["Orders"],
    endpoints: (builder) => ({
        // getOrders: builder.query({
        //     query: ({ companyID, pubID }) => ({
        //         url: `/api/company/${companyID}/pubs/${pubID}/orders/`,
        //         method: "GET",
        //     }),
        //     providesTags: ["Orders"],
        // }),
        updateOrderStatus: builder.mutation({
                query: ({ companyID, pubID, orderID, status }) => ({
                    url: `/api/company/${companyID}/pubs/${pubID}/orders/${orderID}/update-status?status=${status}`,
                    method: "PUT",
                }),
                invalidatesTags: ["Orders"],
        }),
        updateOrderDishes: builder.mutation({
                query: ({ companyID, pubID, orderID, dishes }) => ({
                    url: `/api/company/${companyID}/pubs/${pubID}/orders/${orderID}/update-dishes`,
                    method: "PUT",
                    body: {
                        dishes
                    },
                }),
                invalidatesTags: ["Orders"],
        })
    }),
});

export const {
    useUpdateOrderStatusMutation,
    useUpdateOrderDishesMutation,
} = orders;
