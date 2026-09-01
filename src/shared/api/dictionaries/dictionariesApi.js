import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

// The dictionaries the app used to hardcode: the category-type taxonomy
// (was `placeholderCategories` + a `categories.*` block in three locale
// files), the list of sections and the settings that used to be constants in
// the profile screen. All three are public endpoints, so they resolve before
// the client is even authenticated.
export const dictionariesApi = createApi({
  reducerPath: "dictionariesQuery",
  baseQuery: authenticationBasedQuery,
  tagTypes: ["Dictionaries"],
  endpoints: (builder) => ({
    // ?service_type=flowers narrows the dictionary to one section
    getCategoryTypes: builder.query({
      query: ({ serviceType } = {}) => ({
        url: serviceType
          ? `/api/client/category-types?service_type=${serviceType}`
          : `/api/client/category-types`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
    }),
    getServiceTypes: builder.query({
      query: () => ({
        url: `/api/client/service-types`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
    }),
    getAppSettings: builder.query({
      query: () => ({
        url: `/api/client/app-settings`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
    }),
  }),
});

export const {
  useGetCategoryTypesQuery,
  useGetServiceTypesQuery,
  useGetAppSettingsQuery,
} = dictionariesApi;
