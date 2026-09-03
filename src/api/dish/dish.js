import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

export const dish = createApi({
    reducerPath: "dishQuery",
    baseQuery: authenticationBasedQuery,
    tagTypes: ["Dish"],
    endpoints: (builder) => ({
        createDish: builder.mutation({
            query: ({ companyID, pubID, menuID, categoryID, data }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/dishes`,
                method: "POST",
                body: {
                    name: data.name,
                    price: data.price,
                    sale_price: data.salePrice,
                    ingredients: data.ingredients,
                    place: data.place,
                    visible: data.visible,
                    text_color: data.textColor,
                    is_hit: data.isHit,
                    available: data.available,
                    availability_start: data.availabilityStart,
                    availability_end: data.availabilityEnd,
                    modifier_group_ids: data.modifierGroupIds,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Dish"],
        }),
        updateDish: builder.mutation({
            query: ({ companyID, data, pubID, menuID, categoryID, dishID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/dishes/${dishID}`,
                method: "PUT",
                body: {
                    name: data.name,
                    price: data.price,
                    sale_price: data.salePrice,
                    ingredients: data.ingredients,
                    place: data.place,
                    visible: data.visible,
                    text_color: data.textColor,
                    is_hit: data.isHit,
                    available: data.available,
                    availability_start: data.availabilityStart,
                    availability_end: data.availabilityEnd,
                    modifier_group_ids: data.modifierGroupIds,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Dish", "Pub"],
        }),
        bulkUpdateDishPrices: builder.mutation({
            query: ({ companyID, pubID, menuID, categoryID, percent }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/dishes/bulk-price`,
                method: "PATCH",
                body: { percent },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Dish"],
        }),
        deleteDish: builder.mutation({
            query: ({ companyID, pubID, menuID, categoryID, dishID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/dishes/${dishID}`,
                method: "Delete",
            }),
            invalidatesTags: ["Dish"],
        }),
        getDishes: builder.query({
            query: ({ companyID, pubID, menuID, categoryID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/dishes`,
                method: "GET",
            }),
            providesTags: ["Dish"],
        }),
        // The whole pub in one response - every menu, category and dish,
        // hidden ones included (this route applies no `visible` filter).
        //
        // It is the client-facing endpoint, but it is the only one that
        // returns the pub's entire menu tree in a single request, which is
        // what the frontend-only "discounts & hits" category needs: that
        // category spans every menu of the pub, so assembling it from
        // getDishes would be one request per category.
        //
        // It lives here rather than next to getFullPubInfo in api/pub/pub.js
        // on purpose. Tags do not cross createApi instances, and only in this
        // api does `providesTags: ["Dish"]` make every dish create / update /
        // delete refresh it - which is exactly what happens when a discount is
        // edited from that category.
        getPubMenuTree: builder.query({
            query: ({ pubUrlName }) => ({
                url: `/api/client/pub/${pubUrlName}/`,
                method: "GET",
            }),
            providesTags: ["Dish"],
        }),
        getDish: builder.query({
            query: ({ companyID, pubID, menuID, categoryID, dishID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/dishes/${dishID}`,
                method: "GET",
            }),
            providesTags: ["Dish"],
        }),
        uploadDishImage: builder.mutation({
            query: ({ companyID, pubID, menuID, categoryID, dishID, data }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/dishes/${dishID}/image`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Dish"],
        }),
        moveDishLeft: builder.mutation({
            query: ({ companyID, pubID, menuID, categoryID, dishID, data }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/dishes/${dishID}/move-left`,
                method: "Post",
                body: data,
            }),
            invalidatesTags: ["Dish"],
        }),
        moveDishRight: builder.mutation({
            query: ({ companyID, pubID, menuID, categoryID, dishID, data }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/dishes/${dishID}/move-right`,
                method: "Post",
                body: data,
            }),
            invalidatesTags: ["Dish"],
        }),
    }),
});

export const {
    useCreateDishMutation,
    useUpdateDishMutation,
    useDeleteDishMutation,
    useGetDishQuery,
    useGetDishesQuery,
    useGetPubMenuTreeQuery,
    useUploadDishImageMutation,
    useMoveDishLeftMutation,
    useMoveDishRightMutation,
    useBulkUpdateDishPricesMutation,
} = dish;
