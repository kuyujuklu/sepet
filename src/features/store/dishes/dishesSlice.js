import { createSlice } from "@reduxjs/toolkit";

export const dishImagePopupSlice = createSlice({
  name: "dishImagePopup",
  initialState: {
    dishImagePopup: {
      isOpened: false,
      imagePath: "",
      dishID: null,
      pubID: null,
      dish: null,
      commission: null,
      isAvailableForDelivery: false,
      isPubOpen: null
    },
    basket: {},
  },

  reducers: {
    openDishImagePopup(state, action) {
      state.dishImagePopup.isOpened = true;
      state.dishImagePopup.dishID = action.payload.dishID
      state.dishImagePopup.pubID = action.payload.pubID
      state.dishImagePopup.imagePath = action.payload.imagePath ?? "";
      state.dishImagePopup.dish = action.payload.dish;
      state.dishImagePopup.commission = action.payload.commission
      state.dishImagePopup.isAvailableForDelivery = action.payload.isAvailableForDelivery
      state.dishImagePopup.isPubOpen = action.payload.isPubOpen
    },
    closeDishImagePopup(state) {
      state.dishImagePopup.isOpened = false;
    },
  },
});

export const { openDishImagePopup, closeDishImagePopup } = dishImagePopupSlice.actions;

export const selectDishImagePopup = (state) => state.dishImagePopup.dishImagePopup;

export default dishImagePopupSlice.reducer;
