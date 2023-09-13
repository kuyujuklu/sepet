"use client"
import { configureStore } from "@reduxjs/toolkit";

import pubInfoReducer from "./pubInfoSlice";
import menuReducer from "./menuSlice";
import basketReducer from "./basketSlice";
import { basketMiddleware } from "./middleware/basketMiddleware";

let store

if(typeof window !== "undefined") {
    store = configureStore({
        preloadedState: {
            basketSlice: {
                dishes: JSON.parse(localStorage.getItem("basket")) || {},
            },
        },
        reducer: {
            menuSlice: menuReducer,
            basketSlice: basketReducer,
            pubInfoSlice: pubInfoReducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(...basketMiddleware),
    })
}

export { store }