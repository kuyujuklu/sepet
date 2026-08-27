import { configureStore } from "@reduxjs/toolkit";
import pubReducer from "./pubs/pubsSlice";
import versionReducer from "./version/versionSlice.js";
import { clientAuthApi } from "../../shared/api/client/clientAuth";
import { clientApi } from "../../shared/api/client/clientApi";
import errorHandlingReducer from "./errorHandling/errorHandlingSlice";
import alertReducer from "./alerts/alertSlice";
import linkingReducer from "./linking/linkingSlice";
import authReducer from "./auth/authSlice";
import geolocationReducer from "./geolocation/geolocationSlice";
import sectionReducer from "./sections/sectionSlice";
import basketReducer from "./basket/basketSlice";
import ordersReducer from "./orders/ordersSlice";
import dishImagePopupReducer from "./dishes/dishesSlice";
import notificationsHistoryReducer from "./notifications/notificationsHistorySlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { pubsApi } from "../../shared/api/pubs/pubsApi";
import { categoriesApi } from "../../shared/api/categories/categoriesApi";
import { ordersApi } from "../../shared/api/ordersApi/ordersApi";
import { analyticsMiddleware } from "./analytics/analyticsMiddleware";

export const store = configureStore({
  reducer: {
    [clientAuthApi.reducerPath]: clientAuthApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [pubsApi.reducerPath]: pubsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    version: versionReducer,
    orders: ordersReducer,
    pub: pubReducer,
    basket: basketReducer,
    dishImagePopup: dishImagePopupReducer,
    errorHandling: errorHandlingReducer,
    alerts: alertReducer,
    geolocation: geolocationReducer,
    section: sectionReducer,
    auth: authReducer,
    linking: linkingReducer,
    notificationsHistory: notificationsHistoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(clientAuthApi.middleware)
      .concat(clientApi.middleware)
      .concat(pubsApi.middleware)
      .concat(categoriesApi.middleware)
      .concat(ordersApi.middleware)
      .concat(analyticsMiddleware),
});

setupListeners(store.dispatch);
