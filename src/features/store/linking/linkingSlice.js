import { createSlice } from "@reduxjs/toolkit";

export const linkingSlice = createSlice({
  name: "linking",
  initialState: {
    path: null,
    pubID: null,
    orderID: null,
    pubName: null
  },
  reducers: {
    setPath: (state, action) => {
      state.path = action.payload;
    },
    setPubID: (state, action) => {
      state.pubID = action.payload;
    },
    setPubName: (state, action) => {
      state.pubName = action.payload;
    },
    setOrderID: (state, action) => {
      state.orderID = action.payload;
    },
    clearUrl: (state) => {
      state.url = null;
    },
  },
});

export const {
  setPath,
  clearUrl,
  setPubID,
  setPubName,
  setOrderID
} = linkingSlice.actions;

export const selectPath = (state) => state.linking.path;
export const selectPub = (state) => state.linking.pub;
export const selectPubID = (state) => state.linking.pubID;
export const selectPubName = (state) => state.linking.pubName;
export const selectOrderID = (state) => state.linking.orderID;

export default linkingSlice.reducer;
