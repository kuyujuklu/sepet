import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";
import { isPubOpened } from "../../utils/pub";

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
          if (isPubOpened(response.pubs[i])) {
            response.pubs[i].isOpen = true;
          } else response.pubs[i].isOpen = false;
        }
        return response;
      },
    }),
    getPubInfo: builder.query({
      query: ({ pubID }) => ({
        url: `/api/client/pub/id/${pubID}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response, meta, arg) => {
        if (!response.pub) return response;

        if (isPubOpened(response.pub)) {
          response.pub.isOpen = true;
        } else response.pub.isOpen = false;

        console.log("IS OPEN: ", response.pub.isOpen)
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
