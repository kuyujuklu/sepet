import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  location: null,
  // The client's real, browser-detected position - see
  // utils/browserGeolocation.js. Preferred over the picked city's fixed
  // center point wherever a real lat/lng is needed (shipping price lookup,
  // the order itself).
  geoCoords: null,
  requireLocation: false,
  selectLocationPopup: {
    opened: false
  }
}

const locationSlice = createSlice({
  name: "locationSlice",
  initialState,
  reducers: {
    setLocation(state, action) {
      state.location = action.payload;
    },
    setGeoCoords(state, action) {
      state.geoCoords = action.payload;
    },
    setRequireLocation(state, action) {
      state.requireLocation = action.payload
    },
    requireLocationIfNotSet(state) {
      console.log("IF NOT SET: ", state.location)
      if (!state.location)
        state.requireLocation = true
    },
    openSelectLocationPopup(state) {
      state.selectLocationPopup.opened = true
    },
    closeSelectLocationPopup(state) {
      state.selectLocationPopup.opened = false
    },
  },
});

export const selectLocation = (state) => state.locationSlice.location;
export const selectGeoCoords = (state) => state.locationSlice.geoCoords;
export const selectRequireLocation = (state) => state.locationSlice.requireLocation;
export const selectSelectLocationPopupState = (state) => state.locationSlice.selectLocationPopup;

export const { setLocation, setGeoCoords, setRequireLocation, openSelectLocationPopup, closeSelectLocationPopup, requireLocationIfNotSet } = locationSlice.actions;

export default locationSlice.reducer;
