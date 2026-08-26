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
    // Coarse coordinates (device GPS or a picked city) so that the product
    // screens can be shown right away. Never overwrites an address the client
    // actually typed - that one is exact and carries town/fullAddress.
    setApproximateGeolocation(state, action) {
      if (state.geolocation && !state.geolocation.isApproximate) return;
      if (!action.payload?.lat || !action.payload?.lng) return;

      state.geolocation = {
        lat: action.payload.lat,
        lng: action.payload.lng,
        town: action.payload.town ?? null,
        fullAddress: action.payload.fullAddress ?? null,
        cityId: action.payload.cityId ?? null,
        isApproximate: true,
      };
    },
    setNearGeolocation(state, action) {
      state.nearGeolocationState.nearGeolocation = action.payload ?? null;
    },
    setHasPermission(state, action) {
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
  setApproximateGeolocation,
  setNearGeolocation,
  setHasPermission,
  setSavedAddresses
} = geolocationSlice.actions;

export const selectGeolocation = (state) => state.geolocation.geolocation;

// True while we are working with a guessed location: the client has coordinates
// but never confirmed a delivery address. Checkout has to ask for the real one.
export const selectIsApproximateGeolocation = (state) =>
  !!state.geolocation.geolocation?.isApproximate;

export const selectNearGeolocation = (state) =>
  state.geolocation.nearGeolocationState.nearGeolocation;
export const selectIsGeolocationRequested = (state) =>
  state.geolocation.isGeolocationRequested;

export const selectHasGeolocationPerm = (state) => state.geolocation.hasPerm;
export const selectSavedAddresses = (state) => state.geolocation.savedAddresses;

export default geolocationSlice.reducer;
