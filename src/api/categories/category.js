import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

export const category = createApi({
    reducerPath: "categoryQuery",
    baseQuery: authenticationBasedQuery,
    tagTypes: ["Category"],
    endpoints: (builder) => ({
        createCategory: builder.mutation({
            query: ({ companyID, pubID, menuID, data }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/`,
                method: "POST",
                body: {
                    category_type: data.categoryType,
                    name: data.name,
                    visible: data.visible,
                    place: data.place,
                    text_color: data.textColor,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Category"],
        }),
        updateCategory: builder.mutation({
            query: ({ companyID, data, pubID, menuID, categoryID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/`,
                method: "PUT",
                body: {
                    category_type: data.categoryType,
                    name: data.name,
                    visible: data.visible,
                    text_color: data.textColor,
                    place: 1,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Category"],
        }),
        deleteCategory: builder.mutation({
            query: ({ companyID, pubID, menuID, categoryID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/`,
                method: "Delete",
            }),
            invalidatesTags: ["Category"],
        }),
        getCategories: builder.query({
            query: ({ companyID, pubID, menuID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/`,
                method: "GET",
            }),
            providesTags: ["Category"],
        }),
        getCategory: builder.query({
            query: ({ companyID, pubID, menuID, categoryID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/`,
                method: "GET",
            }),
            providesTags: ["Category"],
        }),
        uploadCategoryImage: builder.mutation({
            query: ({ companyID, pubID, menuID, categoryID, data }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/image`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Category"],
        }),
        moveCategoryLeft: builder.mutation({
            query: ({ companyID, pubID, menuID, categoryID, data }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/move-left`,
                method: "Post",
                body: data,
            }),
            invalidatesTags: ["Category"],
        }),
        moveCategoryRight: builder.mutation({
            query: ({ companyID, pubID, menuID, categoryID, data }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/move-right`,
                method: "Post",
                body: data,
            }),
            invalidatesTags: ["Category"],
        }),
    }),
});

export const {
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useGetCategoryQuery,
    useGetCategoriesQuery,
    useUploadCategoryImageMutation,
    useMoveCategoryLeftMutation,
    useMoveCategoryRightMutation,
} = category;
