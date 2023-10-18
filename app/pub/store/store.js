"use client"
import { configureStore } from "@reduxjs/toolkit";

import pubInfoReducer from "./pubInfoSlice";
import menuReducer from "./menuSlice";
import basketReducer from "./basketSlice";
import { basketMiddleware } from "./middleware/basketMiddleware";

let store

function isTimeInLocalStorageExpired() {
    let time = localStorage.getItem("lastBasketAction")
    if(!time) return true;
    time = parseInt(time)
    if(time + 1000 * 60 * 60 * 24 < new Date().getTime()) return true;
    return false;
}

if(typeof window !== "undefined") {
    store = configureStore({
        preloadedState: {
            basketSlice: {
                dishes: isTimeInLocalStorageExpired() ? {} : (JSON.parse(localStorage.getItem("basket")) || {}),
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