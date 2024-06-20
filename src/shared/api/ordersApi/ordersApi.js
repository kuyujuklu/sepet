import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";
import { orderTypes } from "../../../app/static-data/data";

export const ordersApi = createApi({
  reducerPath: "ordersQuery",
  baseQuery: authenticationBasedQuery,
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    getAllOrdersForClient: builder.query({
      query: () => ({
        url: `/api/client/orders/`,
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),
    createOrder: builder.mutation({
      query: ({ order }) => ({
        url: `/api/client/orders/`,
        method: "POST",
        body: {
          town: order.town,
          comments: order.comments,
          full_address: order.fullAddress,
          main_phone_number: order.mainPhoneNumber,
          second_phone_number: order.secondPhoneNumber,
          payment_type: order.paymentType,
          pub_id: +order.pubID,
          dishes: order.dishes.map((dish) => ({
            count: dish.count,
            dish_id: +dish.dishID,
          })),
          order_type: orderTypes.deliveryOrderType,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    rateOrder: builder.mutation({
      query: ({ orderID, rating }) => ({
        url: `/api/client/orders/${orderID}/rate`,
        method: "POST",
        body: {
          rating: rating,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useRateOrderMutation,
  useCreateOrderMutation,
  useGetAllOrdersForClientQuery,
  useLazyGetAllOrdersForClientQuery,
} = ordersApi;
