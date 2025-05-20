import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const pubsApi = createApi({
  reducerPath: "pubsApi",
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ["Pubs"],
  endpoints: (builder) => ({
    getPubsByLocation: builder.query({
      query: ({ lat, lng }) => ({
        url: `/client/get-available-pubs?lat=${lat}&lng=${lng}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      }),
    }),
    getPubWithShippingPrices: builder.query({
      query: ({ pubName, lat, lng }) => ({
        url: `/client/pub/${pubName}?lat=${lat}&lng=${lng}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      }),
    }),
  }),
});

export const {
  useGetPubsByLocationQuery,
  useGetPubWithShippingPricesQuery
} = pubsApi;
