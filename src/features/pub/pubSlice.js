import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pubID: null,
  createPopup: {
    opened: false,
    companyID: null,
  },
};

const pubSlice = createSlice({
  name: "pubSlice",
  initialState,
  reducers: {
    setPubID(state, action) {
      state.pubID = action.payload;
    },
    openCreatePubPopup(state, action) {
      if (!action.payload) {
        return;
      }
      state.createPopup.companyID = action.payload;
      state.createPopup.opened = true;
    },
    closeCreatePubPopup(state) {
      state.createPopup.opened = false;
      state.createPopup.companyID = null;
    },
  },
});
export const selectPubID = (state) => state.pubSlice.pubID;
export const selectCreatePubPopupState = (state) => state.pubSlice.createPopup;

export const {
  openCreatePubPopup,
  closeCreatePubPopup,
  setPubID,
} = pubSlice.actions;

export default pubSlice.reducer;
