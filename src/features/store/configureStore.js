import { configureStore } from "@reduxjs/toolkit";
import pubsReducer from "./pubs/pubsSlice";
import navbarReducer from "./navbar/navbarSlice";
import { clientAuthApi } from "../../shared/api/client/clientAuth";
import { clientApi } from "../../shared/api/client/clientApi";
import errorHandlingReducer from "./errorHandling/errorHandlingSlice";
import alertReducer from "./alerts/alertSlice";
import authReducer from "./auth/authSlice";
import geolocationReducer from "./geolocation/geolocationSlice";
import basketReducer from "./basket/basketSlice";
import ordersReducer from "./orders/ordersSlice";
import dishImagePopupReducer from "./dishes/dishesSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { pubsApi } from "../../shared/api/pubs/pubsApi";
import { categoriesApi } from "../../shared/api/categories/categoriesApi";
import { ordersApi } from "../../shared/api/ordersApi/ordersApi";

export const store = configureStore({
  reducer: {
    [clientAuthApi.reducerPath]: clientAuthApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [pubsApi.reducerPath]: pubsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    navbar: navbarReducer,
    orders: ordersReducer,
    pubs: pubsReducer,
    basket: basketReducer,
    dishImagePopup: dishImagePopupReducer,
    errorHandling: errorHandlingReducer,
    alerts: alertReducer,
    geolocation: geolocationReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(clientAuthApi.middleware)
      .concat(clientApi.middleware)
      .concat(pubsApi.middleware)
      .concat(categoriesApi.middleware)
      .concat(ordersApi.middleware),
});

setupListeners(store.dispatch);
