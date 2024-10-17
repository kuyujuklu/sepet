import { configureStore } from "@reduxjs/toolkit";
import { company } from "../api/company/company";
import { auth } from "../api/auth/authQuery";
import companyReducer from "../features/company/companySlice"
import pubReducer from "../features/pub/pubSlice"
import menuReducer from "../features/pub/Menus/menuSlice"
import categoryReducer from "../features/pub/Categories/categorySlice"
import dishReducer from "../features/pub/Dishes/dishesSlice"
import authenticationReducer from "../features/auth/authSlice"
import errorHandlerReducer from "../features/errorHandlers/errorHandlerSlice"
import alertsReducer from "../features/alerts/alertSlice"
import shippingReducer from "../features/admin/ShippingAndPreorder/Shipping/shippingSlice"
import googleMapReducer from "../features/GoogleMapsLoader/googleMapsSlice"
import ordersReducer from "../features/admin/Orders/ordersSlice"
import soundReducer from "../features/sound/soundSlice"
import courierInfoPopupReducer from "../features/courier/popups/courierInfoPopupSlice"
import courierOrdersReducer from "../features/courier/courier-orders/courierOrdersSlice"
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { pub } from "../api/pub/pub";
import { menu } from "../api/menu/menu";
import { category } from "../api/categories/category";
import { dish } from "../api/dish/dish";
import { orders } from "../api/orders/orders";
import { courier } from "../api/courier/courier";
export const store = configureStore({
    reducer: {
        companySlice: companyReducer,
        pubSlice: pubReducer,
        menuSlice: menuReducer,
        categorySlice: categoryReducer,
        dishSlice: dishReducer,
        authentication: authenticationReducer,
        errorHandlerSlice: errorHandlerReducer,
        alerts: alertsReducer,
        shippingSlice: shippingReducer,
        googleMaps: googleMapReducer,
        orders: ordersReducer,
        sound: soundReducer,
        courierInfoPopupSlice: courierInfoPopupReducer,
        courierOrders: courierOrdersReducer,
        [auth.reducerPath]: auth.reducer,
        [company.reducerPath]: company.reducer,
        [courier.reducerPath]: courier.reducer,
        [pub.reducerPath]: pub.reducer,
        [menu.reducerPath]: menu.reducer,
        [category.reducerPath]: category.reducer,
        [dish.reducerPath]: dish.reducer,
        [orders.reducerPath]: orders.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
        auth.middleware,
        company.middleware,
        courier.middleware,
        pub.middleware,
        menu.middleware,
        category.middleware,
        dish.middleware,
        orders.middleware
    ),
})

setupListeners(store.dispatch)