import { createApi } from "@reduxjs/toolkit/dist/query/react";
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
                    ingridients: data.ingridients,
                    place: data.place,
                    visible: data.visible,
                    text_color: data.textColor,
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
                    ingridients: data.ingridients,
                    place: data.place,
                    visible: data.visible,
                    text_color: data.textColor,
                },
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
    useUploadDishImageMutation,
    useMoveDishLeftMutation,
    useMoveDishRightMutation,
} = dish;
