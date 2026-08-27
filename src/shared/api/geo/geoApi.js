import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

// Geo dictionary + geocoding. Replaces the hardcoded city table that used to
// live in `shared/utils/cities.js` and the device-only reverse geocoder:
// `geo/search` is what finally gives an order the coordinates of the address
// the client actually typed instead of the coarse city centre.
export const geoApi = createApi({
  reducerPath: "geoQuery",
  baseQuery: authenticationBasedQuery,
  tagTypes: ["Geo"],
  endpoints: (builder) => ({
    getCities: builder.query({
      query: () => ({
        url: `/api/client/geo/cities`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
    }),
    reverseGeocode: builder.query({
      query: ({ lat, lng }) => ({
        url: `/api/client/geo/reverse?lat=${lat}&lng=${lng}`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
    }),
    searchPlace: builder.query({
      query: ({ query }) => ({
        url: `/api/client/geo/search?q=${encodeURIComponent(query ?? "")}`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
    }),
  }),
});

export const {
  useGetCitiesQuery,
  useLazyGetCitiesQuery,
  useReverseGeocodeQuery,
  useLazyReverseGeocodeQuery,
  useLazySearchPlaceQuery,
} = geoApi;
