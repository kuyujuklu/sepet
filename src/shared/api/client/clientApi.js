import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

export const clientApi = createApi({
  reducerPath: "clientQuery",
  baseQuery: authenticationBasedQuery,
  tagTypes: ["Client"],
  endpoints: (builder) => ({
    getClient: builder.query({
      query: () => ({
        url: `/api/client`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      keepUnusedDataFor: 0.0001,
    }),
    deleteAccount: builder.mutation({
      query: () => ({
        url: `/api/client/delete-client-by-token`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Client"],
      keepUnusedDataFor: 0.0001,
    }),
  }),
});

export const { useGetClientQuery, useLazyGetClientQuery, useDeleteAccountMutation } = clientApi;
