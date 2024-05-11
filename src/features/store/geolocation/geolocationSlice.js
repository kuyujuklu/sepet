import { createSlice } from "@reduxjs/toolkit";

export const geolocationSlice = createSlice({
  name: "geolocation",
  initialState: {
    isGeolocationRequested: true,
    geolocation: null,
    nearGeolocation: null,
  },
  reducers: {
    setIsGeolocationRequested: (state, action) => {
      state.isGeolocationRequested = action.payload;
    },
    setGeolocation(state, action) {
      state.geolocation = action.payload ?? null;
    },
    setNearGeolocation(state, action) {
      state.nearGeolocation = action.payload ?? null;
    },
  },
});

export const { setIsGeolocationRequested, setGeolocation, setNearGeolocation } =
  geolocationSlice.actions;

export const selectGeolocation = (state) => state.geolocation.geolocation;
export const selectNearGeolocation = (state) =>
  state.geolocation.nearGeolocation;
export const selectIsGeolocationRequested = (state) =>
  state.geolocation.isGeolocationRequested;

export default geolocationSlice.reducer;
