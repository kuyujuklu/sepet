import { createSlice } from "@reduxjs/toolkit";

export const geolocationSlice = createSlice({
  name: "geolocation",
  initialState: {
    isGeolocationRequested: true,
    geolocation: null,
    nearGeolocationState: {
      nearGeolocation: null,
    },
    hasPerm: null,
    savedAddresses: [],
  },
  reducers: {
    setIsGeolocationRequested: (state, action) => {
      state.isGeolocationRequested = action.payload;
    },
    setGeolocation(state, action) {
      state.geolocation = action.payload ?? null;
    },
    setNearGeolocation(state, action) {
      state.nearGeolocationState.nearGeolocation = action.payload ?? null;
    },
    setHasPermission(state, action) {
      console.log("Set has permission: ", action.payload);
      state.hasPerm = action.payload ?? null;
    },
    setSavedAddresses(state, action) {
      state.savedAddresses = action.payload.addresses;
    },
  },
});

export const {
  setIsGeolocationRequested,
  setGeolocation,
  setNearGeolocation,
  setHasPermission,
  setSavedAddresses
} = geolocationSlice.actions;

export const selectGeolocation = (state) => state.geolocation.geolocation;

export const selectNearGeolocation = (state) =>
  state.geolocation.nearGeolocationState.nearGeolocation;
export const selectIsGeolocationRequested = (state) =>
  state.geolocation.isGeolocationRequested;

export const selectHasGeolocationPerm = (state) => state.geolocation.hasPerm;
export const selectSavedAddresses = (state) => state.geolocation.savedAddresses;

export default geolocationSlice.reducer;
