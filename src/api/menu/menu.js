import { createApi } from "@reduxjs/toolkit/query/react";
import { authenticationBasedQuery } from "../auth/authBasedQuery";

export const menu = createApi({
    reducerPath: "menuQuery",
    baseQuery: authenticationBasedQuery,
    tagTypes: ["Menu"],
    endpoints: (builder) => ({
        createMenu: builder.mutation({
            query: ({ companyID, pubID, data }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/`,
                method: "POST",
                body: {
                    name: data.name,
                    visible: data.visible,
                    place: data.place,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Menu"],
        }),
        updateMenu: builder.mutation({
            query: ({ companyID, data, pubID, menuID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/`,
                method: "PUT",
                body: {
                    name: data.name,
                    visible: data.visible,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Menu"],
        }),
        deleteMenu: builder.mutation({
            query: ({ companyID, pubID, menuID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/`,
                method: "Delete",
            }),
            invalidatesTags: ["Menu"],
        }),
        moveMenuLeft: builder.mutation({
            query: ({ companyID, pubID, menuID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/move-left`,
                method: "Post",
            }),
            invalidatesTags: ["Menu"],
        }),
        moveMenuRight: builder.mutation({
            query: ({ companyID, pubID, menuID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/move-right`,
                method: "Post",
            }),
            invalidatesTags: ["Menu"],
        }),
        getMenus: builder.query({
            query: ({ companyID, pubID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/`,
                method: "GET",
            }),
            providesTags: ["Menu"],
        }),
        getMenu: builder.query({
            query: ({ companyID, pubID, menuID }) => ({
                url: `/api/company/${companyID}/pubs/${pubID}/menus/${menuID}/`,
                method: "GET",
            }),
            providesTags: ["Menu"],
        }),
    }),
});

export const {
    useCreateMenuMutation,
    useUpdateMenuMutation,
    useDeleteMenuMutation,
    useGetMenuQuery,
    useGetMenusQuery,
    useMoveMenuLeftMutation,
    useMoveMenuRightMutation,
} = menu;
