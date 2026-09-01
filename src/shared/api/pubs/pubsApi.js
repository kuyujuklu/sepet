import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";
import { getPubWorkHours } from "../../utils/pub";

// Query string builder that simply drops the parameters we do not have -
// `?lat=undefined` used to reach the server on every screen that renders
// before the location does.
const buildQuery = (params) => {
  const pairs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);

  return pairs.length ? `?${pairs.join("&")}` : "";
};

export const pubsApi = createApi({
  reducerPath: "pubsQuery",
  baseQuery: authenticationBasedQuery,
  tagTypes: ["Pubs"],
  endpoints: (builder) => ({
    getNearbyPubs: builder.query({
      // `section` is the server-side section filter (food|flowers|groceries).
      // Omitted, the response carries every pub, each one carrying the section
      // set in its own settings (`section` / `service_types`).
      query: ({ coords, section }) => ({
        url:
          `/api/client/get-available-pubs` +
          buildQuery({ lat: coords?.lat, lng: coords?.lng, section }),
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),

      transformResponse: (response) => {
        if (!response.pubs) return response;

        for (let i in response.pubs) {
          let pubWorkHours = getPubWorkHours(response.pubs[i])
          response.pubs[i].isOpen = pubWorkHours.isDeliveryAvailable;
          response.pubs[i].isAvailableForDelivery = pubWorkHours.isAvailableForDelivery;
          response.pubs[i].shipping.shipping_work_start = pubWorkHours.shippingWorkStart;
          response.pubs[i].shipping.shipping_work_end = pubWorkHours.shippingWorkEnd;
        }
        return response;
      },
    }),

    // The aggregated home feed. Ranked, interleaved and paged server-side,
    // with a `pub` summary on every dish - so one request replaces the eight
    // full-menu requests the screen used to make.
    getTopDishes: builder.query({
      query: ({ coords, filter, categorySlug, section, limit, offset }) => ({
        url:
          `/api/client/get-available-top-dishes` +
          buildQuery({
            lat: coords?.lat,
            lng: coords?.lng,
            filter,
            category: categorySlug,
            section,
            limit,
            offset,
          }),
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),

      // The pub summary is flat (shipping_price, is_open, ...) while the rest
      // of the app reads `pub.isOpen`; aliasing it here keeps every dish card
      // and price helper working off one shape.
      transformResponse: (response) => {
        if (!response?.dishes) return response;

        response.dishes = response.dishes.map((dish) => ({
          ...dish,
          pub: dish.pub ? { ...dish.pub, isOpen: dish.pub.is_open } : dish.pub,
        }));

        return response;
      },

      // Paging appends instead of replacing, so the feed keeps what is
      // already on screen when the next page arrives.
      serializeQueryArgs: ({ queryArgs, endpointName }) => {
        const { offset, ...rest } = queryArgs ?? {};
        return `${endpointName}(${JSON.stringify(rest)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.offset) {
          currentCache.dishes = newItems.dishes;
          currentCache.total = newItems.total;
          return;
        }

        const knownKeys = new Set(
          (currentCache.dishes ?? []).map((dish) => `${dish.pub?.id}-${dish.id}`),
        );

        currentCache.dishes = [
          ...(currentCache.dishes ?? []),
          ...(newItems.dishes ?? []).filter(
            (dish) => !knownKeys.has(`${dish.pub?.id}-${dish.id}`),
          ),
        ];
        currentCache.total = newItems.total;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.offset !== previousArg?.offset,
    }),

    getPubInfo: builder.query({
      // With coordinates the by-id route answers with `distance` and the
      // three shipping prices too, so no screen has to hold the nearby-pubs
      // response next to this one just to show a delivery price.
      query: ({ pubID, pubName, coords }) => {
        const withCoords = buildQuery({ lat: coords?.lat, lng: coords?.lng });

        return {
          url: pubID
            ? `/api/client/pub/id/${pubID}${withCoords}`
            : `/api/client/pub/${pubName}${withCoords}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      },
      transformResponse: (response) => {
        if (!response.pub) return response;

        let pubWorkHours = getPubWorkHours(response?.pub)
        response.pub.isOpen = pubWorkHours.isDeliveryAvailable;
        // Only meaningful when coordinates were sent: the server then answers
        // with shipping.available = false for a point outside every shape
        response.pub.isAvailableForDelivery = pubWorkHours.isAvailableForDelivery;
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
  useGetTopDishesQuery,
  useGetPubInfoQuery,
  useLazyGetPubInfoQuery,
} = pubsApi;
