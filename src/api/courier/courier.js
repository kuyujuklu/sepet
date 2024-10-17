import { createApi } from '@reduxjs/toolkit/query/react';
import { authenticationBasedQuery } from '../auth/authBasedQuery';

export const courier = createApi({
    reducerPath: 'courierQuery',
    baseQuery: authenticationBasedQuery,
    tagTypes: ['Courier'],
    endpoints: (builder) => ({
        getCourier: builder.query({
            query: () => `/api/courier/`,
            providesTags: ['Courier']
        }),
        getCourierByID: builder.query({
            query: ({ courierID }) => ({
                url: `/api/courier/${courierID}/`,
                method: "GET",
            }),
        }),
        updateCourier: builder.mutation({
            query: ({ courierID, data }) => ({
                url: `/api/courier/${courierID}/`,
                method: "PUT",
                body: {
                    full_name: data.fullName,
                    phone_number: data.phoneNumber,
                    gender: data.gender,
                    birth_date: data.birthDate,
                    location: data.location,
                    telegram_username: data.telegramUsername
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Courier"],
        }),
        uploadCourierImage: builder.mutation({
            query: ({ courierID, data }) => ({
                url: `/api/courier/${courierID}/image`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Courier"],
        }),
        reserveOrder: builder.mutation({
            query: ({ courierID, orderID }) => ({
                url: `/api/courier/${courierID}/reserve-order`,
                method: "POST",
                body: {
                    order_id: orderID
                },
            }),
        }),
        setOrderStatusToCompleted: builder.mutation({
                query: ({ courierID, orderID }) => ({
                    url: `/api/courier/${courierID}/set-order-to-completed`,
                    method: "Post",
                    body: {
                        order_id: orderID
                    },
                }),
                invalidatesTags: ["Orders"],
        }),
        setOrderStatusToCanceled: builder.mutation({
                query: ({ courierID, orderID }) => ({
                    url: `/api/courier/${courierID}/set-order-to-canceled`,
                    method: "Post",
                    body: {
                        order_id: orderID
                    },
                }),
                invalidatesTags: ["Orders"],
        }),
    }),
    
})

export const { useGetCourierQuery, useGetCourierByIDQuery, useLazyGetCourierByIDQuery , useLazyGetCourierQuery, useUpdateCourierMutation, useUploadCourierImageMutation, useReserveOrderMutation, useSetOrderStatusToCanceledMutation, useSetOrderStatusToCompletedMutation} = courier;