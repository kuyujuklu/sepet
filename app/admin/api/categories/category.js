import { createApi } from "@reduxjs/toolkit/dist/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

export const category = createApi({
    reducerPath: 'categoryQuery',
    baseQuery: authenticationBasedQuery,
    tagTypes: ['Category'],
    endpoints: (builder) => ({
        createCategory: builder.mutation({
            query: ({companyID, pubID, menuID, data}) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/`,
                method: 'POST',
                body: {
                    name: data.name,
                    visible: data.visible,
                    place: data.place,
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            invalidatesTags: ['Category']
        }),
        updateCategory: builder.mutation({
            query: ({companyID, data, pubID, menuID, categoryID}) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/`,
                method: 'PUT',
                body: {
                    name: data.name,
                    visible: data.visible,
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            invalidatesTags: ['Category']
        }),
        deleteCategory: builder.mutation({
            query: ({companyID, pubID, menuID, categoryID}) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/`,
                method: 'Delete',
            }),
            invalidatesTags: ['Category']
        }),
        getCategories: builder.query({
            query: ({companyID, pubID, menuID}) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/`,
                method: 'GET',
            }),
            providesTags: ['Category']
        }),
        getCategory: builder.query({
            query: ({companyID, pubID, menuID, categoryID}) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/`,
                method: 'GET',
            }),
            providesTags: ['Category']
        }),
        uploadCategoryImage: builder.mutation({
            query: ({companyID, pubID, menuID, categoryID, data}) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/categories/${categoryID}/image`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Category']
        })
    }),
    
})

export const { useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, useGetCategoryQuery, useGetCategoriesQuery, useUploadCategoryImageMutation } = category;