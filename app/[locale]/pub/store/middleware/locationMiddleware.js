import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
  setGeoCoords,
  setManualAddress
} from "../locationSlice.js";

import { store } from "../store";

// Mirrors the real detected/picked position - same localStorage key the
// landing page's Main.jsx reads/writes, so a position set on either side is
// visible to the other.
const writeGeoCoords = (store) => {
  const geoCoords = store?.getState().locationSlice?.geoCoords;
  if (!geoCoords) return;

  localStorage.setItem("geoCoords", JSON.stringify(geoCoords));
};

// Same idea for the address label - previously only the landing page wrote
// this key itself (SelectLocationPopup only ever dispatched into redux, so
// a correction made there didn't survive a hard refresh, only a same-tab
// navigation). Mirroring it here the same way geoCoords already is closes
// that gap for both sides.
const writeManualAddress = (store) => {
  const manualAddress = store?.getState().locationSlice?.manualAddress;
  if (!manualAddress) return;

  localStorage.setItem("manualAddress", JSON.stringify(manualAddress));
};

export const listenToSetGeoCoords = createListenerMiddleware();
listenToSetGeoCoords.startListening({
  actionCreator: setGeoCoords,
  effect: () => writeGeoCoords(store),
});

export const listenToSetManualAddress = createListenerMiddleware();
listenToSetManualAddress.startListening({
  actionCreator: setManualAddress,
  effect: () => writeManualAddress(store),
});

export const locationMiddleware = [
  listenToSetGeoCoords.middleware,
  listenToSetManualAddress.middleware,
];
