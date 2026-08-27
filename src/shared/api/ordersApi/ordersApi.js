import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";
import { orderTypes } from "../../../app/static-data/data";
import { events, track } from "../../analytics/analytics";

// Where the order came from. The server records it on the order and the panel
// reads it back, so the app always says the same thing about itself.
export const ORDER_SOURCE_APPLICATION = "application";

// One body for both POST /orders and POST /orders/preview: the preview is
// only authoritative because it prices exactly what the create call will get.
export const buildOrderBody = (order) => ({
  town: order.town,
  comments: order.comments,
  full_address: order.fullAddress,
  main_phone_number: order.mainPhoneNumber,
  second_phone_number: order.secondPhoneNumber,
  payment_type: order.paymentType,
  pub_id: +order.pubID,
  dishes: (order.dishes ?? []).map((dish) => ({
    count: dish.count,
    dish_id: +dish.dishID,
  })),
  order_type: orderTypes.deliveryOrderType,
  lat: order.lat,
  lng: order.lng,
  source: ORDER_SOURCE_APPLICATION,
});

export const ordersApi = createApi({
  reducerPath: "ordersQuery",
  baseQuery: authenticationBasedQuery,
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    // `?status=active` is the filter behind the profile badge; without one the
    // response is the whole history. Either way it carries `has_active_order`.
    getAllOrdersForClient: builder.query({
      query: ({ status } = {}) => ({
        url: status
          ? `/api/client/orders?status=${encodeURIComponent(status)}`
          : `/api/client/orders`,
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),

    // The authoritative totals of a basket, priced by the same code that
    // prices the order - including the pub's minimum, which is now a hard
    // rule rather than a hint (`can_be_ordered`).
    previewOrder: builder.mutation({
      query: ({ order }) => ({
        url: `/api/client/orders/preview`,
        method: "POST",
        body: buildOrderBody(order),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    createOrder: builder.mutation({
      query: ({ order }) => ({
        url: `/api/client/orders/`,
        method: "POST",
        body: buildOrderBody(order),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Orders"],

      // The whole order funnel is tracked here instead of in the screens,
      // so every future caller of createOrder is covered
      async onQueryStarted({ order }, { queryFulfilled }) {
        const orderProps = {
          pub_id: +order?.pubID,
          items_count: order?.dishes?.length ?? 0,
          payment_type: order?.paymentType,
        };

        track(events.orderSubmitted, orderProps);

        try {
          const { data } = await queryFulfilled;

          track(events.orderSucceeded, {
            ...orderProps,
            order_id: data?.order?.id ?? data?.id,
          });
        } catch (error) {
          track(events.orderFailed, {
            ...orderProps,
            status: error?.error?.status,
          });
        }
      },
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
  usePreviewOrderMutation,
  useGetAllOrdersForClientQuery,
  useLazyGetAllOrdersForClientQuery,
} = ordersApi;
