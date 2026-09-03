import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

export const orders = createApi({
  reducerPath: "ordersQuery",
  baseQuery: authenticationBasedQuery,
  tagTypes: ["Orders", "StatusEvents"],
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
      invalidatesTags: (result, error, { orderID }) => [
        "Orders",
        { type: "StatusEvents", id: orderID },
      ],
    }),
    getOrderStatusEvents: builder.query({
      query: ({ companyID, pubID, orderID }) => ({
        url: `/api/company/${companyID}/pubs/${pubID}/orders/${orderID}/status-events`,
        method: "GET",
      }),
      providesTags: (result, error, { orderID }) => [
        { type: "StatusEvents", id: orderID },
      ],
    }),
    getEstimatedPreparingMinutes: builder.query({
      query: ({ companyID, pubID, shapeID }) => ({
        url: `/api/company/${companyID}/pubs/${pubID}/orders/estimated-preparing-minutes${shapeID ? `?shape_id=${shapeID}` : ""
          }`,
        method: "GET",
      }),
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
    }),
  }),
});

export const {
  useUpdateOrderStatusMutation,
  useUpdateOrderDishesMutation,
  useGetOrderStatusEventsQuery,
  useGetEstimatedPreparingMinutesQuery,
} = orders;
