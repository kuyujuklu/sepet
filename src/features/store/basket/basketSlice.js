import { createSlice } from "@reduxjs/toolkit";

export const basketSlice = createSlice({
  name: "basket",
  initialState: {
    clearBasketPopup: {
      isOpened: false,
      confirmingAction: null,
      text: "Are you sure you want to clear your basket?",
      buttonText: "OK",
    },
    basket: {},
    pubID: null,
  },

  reducers: {
    clearBasket(state) {
      state.basket = {};
    },
    openClearBasketPopup(state) {
      state.clearBasketPopup.isOpened = true;
    },
    closeClearBasketPopup(state) {
      state.clearBasketPopup.confirmingAction = null;
      state.clearBasketPopup.text =
        "Are you sure you want to clear your basket?";
      state.clearBasketPopup.buttonText = "OK";
      state.clearBasketPopup.isOpened = false;
    },
    doClearPopupConfirmingAction(state) {
      state.basket = {};

      if (!state.clearBasketPopup.confirmingAction) return;

      const action = state.clearBasketPopup.confirmingAction;
      state.clearBasketPopup.confirmingAction = null;

      if (action.type === "increaseDish") {
        state.pubID = action.pubID;
        state.basket[action.dishID] = { count: 1, price: action.price };
      }
    },
    clearBasketPopup(state, action) {
      state.basket = {};
      state.pubID = null;
    },
    setBasket(state, action) {
      if (!action.payload.pubID || !action.payload.basket) return;

      state.basket = action.payload.basket;
      state.pubID = action.payload.pubID;
    },
    increaseDish(state, action) {
      const id = +action.payload?.id;
      if (!id) return;

      const pubID = action.payload?.pubID;
      if (!pubID) return;

      // If the dish is from another pub
      if (state.pubID && state.pubID !== pubID) {
        state.clearBasketPopup.isOpened = true;
        state.clearBasketPopup.text =
          "Вы уверены что хотите добавить блюдо из другого заведения? Ваша корзина будет очищена";
        state.clearBasketPopup.confirmingAction = {
          type: "increaseDish",
          pubID: pubID,
          price: action.payload.price,
          dishID: id,
        };
        return;
      }

      state.pubID = pubID;

      if (!state.basket[id])
        state.basket[id] = { count: 0, price: action.payload.price };

      state.basket[id].count++;
    },
    decreaseDish(state, action) {
      if (!action.payload?.id) return;

      const id = +action.payload.id;

      if (!state.basket[id]) return;

      if (!state.basket[id].count || state.basket[id].count <= 1) {
        delete state.basket[id];
        if (Object.keys(state.basket).length === 0) state.pubID = null;
        return;
      }

      const currentCount = state.basket[id]?.count;

      state.basket[id].count = currentCount - 1;
    },
  },
});

export const {
  increaseDish,
  decreaseDish,
  openClearBasketPopup,
  closeClearBasketPopup,
  doClearPopupConfirmingAction,
  setBasket,
  clearBasket
} = basketSlice.actions;

export const selectBasket = (state) => state.basket.basket;
export const selectBasketPubID = (state) => state.basket.pubID;
export const selectDishFromBasket = (id) => (state) =>
  state.basket.basket[id] || null;
export const selectClearBasketPopup = (state) => state.basket.clearBasketPopup;

export default basketSlice.reducer;
