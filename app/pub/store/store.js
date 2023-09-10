import { configureStore } from "@reduxjs/toolkit";

import pubInfoReducer from "./pubInfoSlice";
import menuReducer from "./menuSlice";
import basketReducer from "./basketSlice";

export const store = configureStore({
    reducer: {
        menuSlice: menuReducer,
        basketSlice: basketReducer,
        pubInfoSlice: pubInfoReducer,
    },
})