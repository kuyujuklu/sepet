import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const ordersApi = createApi({
    reducerPath: "ordersApi",
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ["Orders"],
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: ({order}) => ({
                url: `/orders`,
                method: 'POST',
                body: {
                    town: order.town,
                    comments: order.comments,
                    full_address: order.fullAddress,
                    main_phone_number: order.mainPhoneNumber,
                    second_phone_number: order.secondPhoneNumber,
                    payment_type: order.paymentType,
                    pub_id: +order.pubID,
                    dishes: order.dishes.map(dish => ({count: dish.count, dish_id: +dish.dishID})),
                    order_type: order.orderType,
                    table_for_in_place_order: +order.tableNumber,
                },
                headers: {
                    'Content-Type': 'application/json'
                },
            }),
            invalidatesTags: ["Orders"],
        }),
    }),
});

export const {
    useCreateOrderMutation,
} = ordersApi;