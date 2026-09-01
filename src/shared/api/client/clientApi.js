import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

export const clientApi = createApi({
  reducerPath: "clientQuery",
  baseQuery: authenticationBasedQuery,
  tagTypes: ["Client"],
  endpoints: (builder) => ({
    getAppVersionInfo: builder.query({
      query: () => ({
        url: `/api/client/app-version-info`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      keepUnusedDataFor: 0.0001,
    }),
    // Carries `has_active_order` next to the client: the badge on the profile
    // button is the only signal left that an order is on its way.
    getClient: builder.query({
      query: () => ({
        url: `/api/client`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      providesTags: ["Client"],
      keepUnusedDataFor: 0.0001,
    }),
    // The consent record: `accepted` plus the version of the policy that was
    // actually shown, so a re-consent can be asked for when the text changes.
    setAnalyticsConsent: builder.mutation({
      query: ({ accepted, policyVersion }) => ({
        url: `/api/client/analytics-consent`,
        method: "POST",
        body: {
          accepted: !!accepted,
          policy_version: policyVersion ?? "",
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Client"],
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

export const {
  useGetClientQuery,
  useLazyGetClientQuery,
  useDeleteAccountMutation,
  useGetAppVersionInfoQuery,
  useSetAnalyticsConsentMutation,
} = clientApi;
