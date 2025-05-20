import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
  setLocation
} from "../locationSlice.js";

import { store } from "../store";

const write = (store) => {
  if (!store?.getState().locationSlice?.location) return;
  console.log("write", store);
  localStorage.setItem(
    "location",
    JSON.stringify(store.getState().locationSlice.location)
  );
  localStorage.setItem("lastLocationAction", new Date().getTime());
};

export const listenToSetLocation = createListenerMiddleware();
listenToSetLocation.startListening({
  actionCreator: setLocation,
  effect: () => write(store),
});
export const locationMiddleware = [
  listenToSetLocation.middleware,
];
