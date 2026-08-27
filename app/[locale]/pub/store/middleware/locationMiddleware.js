import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
  setLocation,
  setGeoCoords
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

// Mirrors `write`, but for the real detected position instead of the picked
// city - same localStorage key the landing page's Main.jsx reads/writes, so
// a position detected on either side is visible to the other.
const writeGeoCoords = (store) => {
  const geoCoords = store?.getState().locationSlice?.geoCoords;
  if (!geoCoords) return;

  localStorage.setItem("geoCoords", JSON.stringify(geoCoords));
};

export const listenToSetLocation = createListenerMiddleware();
listenToSetLocation.startListening({
  actionCreator: setLocation,
  effect: () => write(store),
});

export const listenToSetGeoCoords = createListenerMiddleware();
listenToSetGeoCoords.startListening({
  actionCreator: setGeoCoords,
  effect: () => writeGeoCoords(store),
});

export const locationMiddleware = [
  listenToSetLocation.middleware,
  listenToSetGeoCoords.middleware,
];
