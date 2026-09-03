import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

// Separate from subscribe-token.js on purpose: that call happens before/
// independent of a full client session (plain fetch, no auth header), while
// this one only makes sense for an already-authenticated client tapping a
// push - so it goes through the same authenticationBasedQuery every other
// client-authenticated call in the app uses (access token header + 401
// refresh-and-retry), instead of reimplementing that by hand.
export const notificationsApi = createApi({
  reducerPath: "notificationsQuery",
  baseQuery: authenticationBasedQuery,
  endpoints: (builder) => ({
    // Fire-and-forget from NotificationHandler on tap - drives the
    // "opened" column in the superadmin's push campaign history. No
    // deep-link resolution depends on this succeeding, so callers don't
    // need to await or handle its result.
    markPushCampaignOpened: builder.mutation({
      query: ({ campaignID }) => ({
        url: `/api/client/push-campaigns/${campaignID}/opened`,
        method: "POST",
      }),
    }),
  }),
});

export const { useMarkPushCampaignOpenedMutation } = notificationsApi;
