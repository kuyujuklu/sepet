import { configureStore } from "@reduxjs/toolkit";
import { company } from "../api/company/company";
import { auth } from "../api/auth/authQuery";
import companyReducer from "../features/company/companySlice"
import pubReducer from "../features/pub/pubSlice"
import menuReducer from "../features/pub/Menus/menuSlice"
import categoryReducer from "../features/pub/Categories/categorySlice"
import authenticationReducer from "../features/auth/authSlice"
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { pub } from "../api/pub/pub";
import { menu } from "../api/menu/menu";
import { category } from "../api/categories/category";

export const store = configureStore({
    reducer: {
        companySlice: companyReducer,
        pubSlice: pubReducer,
        menuSlice: menuReducer,
        categorySlice: categoryReducer,
        authentication: authenticationReducer,
        [auth.reducerPath]: auth.reducer,
        [company.reducerPath]: company.reducer,
        [pub.reducerPath]: pub.reducer,
        [menu.reducerPath]: menu.reducer,
        [category.reducerPath]: category.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
        auth.middleware,
        company.middleware,
        pub.middleware,
        menu.middleware,
        category.middleware
    ),
})

setupListeners(store.dispatch)