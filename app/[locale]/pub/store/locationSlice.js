import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // The precise point behind the current address - real device geolocation
  // or a manually placed map pin, no way (or need) to tell which. This is
  // the only thing that ever drives zone-based pricing/nearby-pub search.
  geoCoords: null,
  // {town, street} - the editable label for that same point, always set
  // together with geoCoords through the map picker (reverse-geocoded, then
  // correctable by hand). No longer a "manual fallback" alternative to a
  // picked city - the city-list picker is gone, this is the only address
  // representation left.
  manualAddress: null,
  requireLocation: false,
  selectLocationPopup: {
    opened: false
  }
}

const locationSlice = createSlice({
  name: "locationSlice",
  initialState,
  reducers: {
    setGeoCoords(state, action) {
      state.geoCoords = action.payload;
    },
    setManualAddress(state, action) {
      state.manualAddress = action.payload;
    },
    setRequireLocation(state, action) {
      state.requireLocation = action.payload
    },
    requireLocationIfNotSet(state) {
      if (!state.geoCoords)
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

export const selectGeoCoords = (state) => state.locationSlice.geoCoords;
export const selectManualAddress = (state) => state.locationSlice.manualAddress;
export const selectRequireLocation = (state) => state.locationSlice.requireLocation;
export const selectSelectLocationPopupState = (state) => state.locationSlice.selectLocationPopup;

export const { setGeoCoords, setManualAddress, setRequireLocation, openSelectLocationPopup, closeSelectLocationPopup, requireLocationIfNotSet } = locationSlice.actions;

export default locationSlice.reducer;
