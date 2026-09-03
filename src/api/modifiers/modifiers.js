import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

export const modifiers = createApi({
  reducerPath: "modifiersQuery",
  baseQuery: authenticationBasedQuery,
  tagTypes: ["ModifierGroup"],
  endpoints: (builder) => ({
    getModifierGroups: builder.query({
      query: ({ companyID, pubID }) => ({
        url: `/api/company/${companyID}/pubs/${pubID}/modifier-groups`,
        method: "GET",
      }),
      providesTags: ["ModifierGroup"],
    }),
    createModifierGroup: builder.mutation({
      query: ({ companyID, pubID, data }) => ({
        url: `/api/company/${companyID}/pubs/${pubID}/modifier-groups`,
        method: "POST",
        body: {
          name: data.name,
          options: data.options,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["ModifierGroup"],
    }),
    updateModifierGroup: builder.mutation({
      query: ({ companyID, pubID, groupID, data }) => ({
        url: `/api/company/${companyID}/pubs/${pubID}/modifier-groups/${groupID}`,
        method: "PUT",
        body: {
          name: data.name,
          options: data.options,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      // Note: this can't also invalidate the separate dish.js API's "Dish"
      // tag - RTK Query tags don't cross createApi/reducerPath boundaries.
      // The dish list/detail views naturally refetch on their own next
      // mount, so a renamed/deleted group's dish-side display just isn't
      // instantly live while you're on this page.
      invalidatesTags: ["ModifierGroup"],
    }),
    deleteModifierGroup: builder.mutation({
      query: ({ companyID, pubID, groupID }) => ({
        url: `/api/company/${companyID}/pubs/${pubID}/modifier-groups/${groupID}`,
        method: "Delete",
      }),
      // Note: this can't also invalidate the separate dish.js API's "Dish"
      // tag - RTK Query tags don't cross createApi/reducerPath boundaries.
      // The dish list/detail views naturally refetch on their own next
      // mount, so a renamed/deleted group's dish-side display just isn't
      // instantly live while you're on this page.
      invalidatesTags: ["ModifierGroup"],
    }),
  }),
});

export const {
  useGetModifierGroupsQuery,
  useCreateModifierGroupMutation,
  useUpdateModifierGroupMutation,
  useDeleteModifierGroupMutation,
} = modifiers;
