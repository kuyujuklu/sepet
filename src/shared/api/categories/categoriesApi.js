import { createApi } from '@reduxjs/toolkit/query/react'
import { authenticationBasedQuery } from '../auth/authBasedQuery';

export const categoriesApi = createApi({
    reducerPath: "categoriesQuery",
    baseQuery: authenticationBasedQuery,
    tagTypes: ["Categories", "NearbyCategories"],
    endpoints: (builder) => ({
        getNearbyCategories: builder.query({
            query: ({coords}) => ({
                url: `/api/client/get-available-categories?lat=${coords?.lat}&lng=${coords?.lng}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
        }),
    }),
});

export const {
    useGetNearbyCategoriesQuery,
    useLazyGetNearbyCategoriesQuery
} = categoriesApi;