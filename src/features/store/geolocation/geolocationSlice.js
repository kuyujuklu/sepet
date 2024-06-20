import { createSlice } from "@reduxjs/toolkit";

export const geolocationSlice = createSlice({
  name: "geolocation",
  initialState: {
    isGeolocationRequested: true,
    geolocation: null,
    nearGeolocationState :{
      nearGeolocation: null,
    },
    hasPerm: null
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
      console.log("SEt has permission:: ", action.payload)
      state.hasPerm = action.payload ?? null;
    },
  },
});

export const {
  setIsGeolocationRequested,
  setGeolocation,
  setNearGeolocation,
  setHasPermission,
} = geolocationSlice.actions;

export const selectGeolocation = (state) => state.geolocation.geolocation;

export const selectNearGeolocation = (state) =>
  state.geolocation.nearGeolocationState.nearGeolocation;
export const selectIsGeolocationRequested = (state) =>
  state.geolocation.isGeolocationRequested;

export const selectHasGeolocationPerm = (state) => state.geolocation.hasPerm;

export default geolocationSlice.reducer;
