"use client"
import { configureStore } from "@reduxjs/toolkit";

import pubInfoReducer from "./pubInfoSlice";
import menuReducer from "./menuSlice";
import basketReducer from "./basketSlice";
import locationReducer from "./locationSlice.js";
import ordersReducer from "./orderSlice";
import { locationMiddleware } from "./middleware/locationMiddleware.js";
import { basketMiddleware } from "./middleware/basketMiddleware.js";
import { ordersApi } from "../api/rtk-query/orders";
import { pubsApi } from "../api/rtk-query/pubs";


export function isTimeInLocalStorageExpired() {
  let time = localStorage.getItem("lastBasketAction")
  if (!time) return true;
  time = parseInt(time)
  if (time + 1000 * 60 * 60 * 24 < new Date().getTime()) return true;
  return false;
}

export const store = configureStore({
  reducer: {
    menuSlice: menuReducer,
    basketSlice: basketReducer,
    pubInfoSlice: pubInfoReducer,
    orderSlice: ordersReducer,
    locationSlice: locationReducer,
    [pubsApi.reducerPath]: pubsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(...basketMiddleware).concat(...locationMiddleware)
    .concat(ordersApi.middleware)
    .concat(pubsApi.middleware),
})
