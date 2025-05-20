import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: null,
  nearbyPubs: null,
  isPubInNearbyPubs: null,
};

const pubInfoSlice = createSlice({
  name: "pubInfoSlice",
  initialState,
  reducers: {
    setData(state, action) {
      let pub = {}
      if (action.payload.pub) {
        pub = { ...action.payload.pub }
        pub.real_id = action.payload.pub.id
        pub.id = action.payload.pub.url_name
      }
      state.data = { ...action.payload };
      state.data.pub = pub;

      if (state.nearbyPubs && state.data) {
        let contains = false
        for (const pub in state.nearbyPubs) {
          if (pub.id === state?.data?.pub?.id) {
            contains = true
          }
        }
        state.isPubInNearbyPubs = contains
      }

    },
    setNearbyPubs(state, action) {
      if (!action.payload) return;

      const nearbyPubs = action.payload

      state.nearbyPubs = nearbyPubs

      if (nearbyPubs && state.data) {
        let contains = false
        for (const pub in nearbyPubs) {
          if (pub.id === state?.data?.pub?.id) {
            contains = true
          }
        }
        state.isPubInNearbyPubs = contains
      }
    }
  },
});

export const selectData = (state) => state.pubInfoSlice.data;
export const selectNearbyPubs = (state) => state.pubInfoSlice.nearbyPubs
export const selectIsPubInNearbyPubs = (state) => state.pubInfoSlice.isPubInNearbyPubs

export const { setData, setNearbyPubs } = pubInfoSlice.actions;

export default pubInfoSlice.reducer;
