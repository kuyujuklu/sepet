import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  location: null,
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
export const selectRequireLocation = (state) => state.locationSlice.requireLocation;
export const selectSelectLocationPopupState = (state) => state.locationSlice.selectLocationPopup;

export const { setLocation, setRequireLocation, openSelectLocationPopup, closeSelectLocationPopup, requireLocationIfNotSet } = locationSlice.actions;

export default locationSlice.reducer;
