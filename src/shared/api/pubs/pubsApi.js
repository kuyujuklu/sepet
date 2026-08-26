import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";
import { getPubWorkHours } from "../../utils/pub";

export const pubsApi = createApi({
  reducerPath: "pubsQuery",
  baseQuery: authenticationBasedQuery,
  tagTypes: ["Pubs"],
  endpoints: (builder) => ({
    getNearbyPubs: builder.query({
      query: ({ coords }) => ({
        url: `/api/client/get-available-pubs?lat=${coords?.lat}&lng=${coords?.lng}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),

      transformResponse: (response, meta, arg) => {

        if (!response.pubs) return response;

        for (let i in response.pubs) {
          let pubWorkHours = getPubWorkHours(response.pubs[i])
          response.pubs[i].isOpen = pubWorkHours.isDeliveryAvailable;
          response.pubs[i].shipping.shipping_work_start = pubWorkHours.shippingWorkStart;
          response.pubs[i].shipping.shipping_work_end = pubWorkHours.shippingWorkEnd;
        }
        return response;
      },
    }),
    getPubInfo: builder.query({
      query: ({ pubID, pubName }) => {
        return {
          url: pubID ? `/api/client/pub/id/${pubID}` : `/api/client/pub/${pubName}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      },
      transformResponse: (response, meta, arg) => {
        if (!response.pub) return response;

        let pubWorkHours = getPubWorkHours(response?.pub)
        response.pub.isOpen = pubWorkHours.isDeliveryAvailable;
        response.pub.shipping.shipping_work_start = pubWorkHours.shippingWorkStart;
        response.pub.shipping.shipping_work_end = pubWorkHours.shippingWorkEnd;
        return response;
      },
    }),
  }),
});

export const {
  useGetNearbyPubsQuery,
  useLazyGetNearbyPubsQuery,
  useGetPubInfoQuery,
  useLazyGetPubInfoQuery,
} = pubsApi;
