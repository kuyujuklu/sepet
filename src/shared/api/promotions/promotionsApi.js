import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";
import { isPromotionActive } from "../../utils/promotions";

export const promotionsApi = createApi({
  reducerPath: "promotionsQuery",
  baseQuery: authenticationBasedQuery,
  tagTypes: ["Promotions", "NearbyPromotions"],
  endpoints: (builder) => ({
    getNearbyPromotions: builder.query({
      query: ({ coords }) => ({
        url: `/api/client/get-available-promotions?lat=${coords?.lat}&lng=${coords?.lng}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),

      transformResponse: (response) => {
        if (!response?.promotions) return { promotions: [] };

        //Hide promotions that are not visible or already finished
        const promotions = response.promotions.filter((promotion) =>
          isPromotionActive(promotion),
        );

        return { ...response, promotions };
      },
    }),
    getPubPromotions: builder.query({
      query: ({ pubID }) => ({
        url: `/api/client/pub/id/${pubID}/promotions`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),

      transformResponse: (response) => {
        if (!response?.promotions) return { promotions: [] };

        const promotions = response.promotions.filter((promotion) =>
          isPromotionActive(promotion),
        );

        return { ...response, promotions };
      },
    }),
  }),
});

export const {
  useGetNearbyPromotionsQuery,
  useLazyGetNearbyPromotionsQuery,
  useGetPubPromotionsQuery,
  useLazyGetPubPromotionsQuery,
} = promotionsApi;
