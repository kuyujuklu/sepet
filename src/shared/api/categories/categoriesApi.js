import { createApi } from '@reduxjs/toolkit/query/react'
import { authenticationBasedQuery } from '../auth/authBasedQuery';

export const categoriesApi = createApi({
    reducerPath: "categoriesQuery",
    baseQuery: authenticationBasedQuery,
    tagTypes: ["Categories", "NearbyCategories"],
    endpoints: (builder) => ({
        // `section` filters server-side on the service type of the *pub* the
        // category belongs to - a category has no section of its own, its
        // establishment does.
        getNearbyCategories: builder.query({
            query: ({coords, section}) => {
                const params = [`lat=${coords?.lat}`, `lng=${coords?.lng}`];
                if (section) params.push(`section=${encodeURIComponent(section)}`);

                return {
                    url: `/api/client/get-available-categories?${params.join("&")}`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            },
        }),
    }),
});

export const {
    useGetNearbyCategoriesQuery,
    useLazyGetNearbyCategoriesQuery
} = categoriesApi;
