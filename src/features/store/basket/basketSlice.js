import { createSlice } from "@reduxjs/toolkit";

export const basketSlice = createSlice({
  name: "basket",
  initialState: {
    clearBasketPopup: {
      isOpened: false,
      confirmingAction: null,
      text: "basket_popup.another_pub_warning",
      okButtonText: "basket_popup.ok_button",
      cancelButtonText: "basket_popup.cancel_button",
    },
    // Asking before a line disappears: a stepper tapped one time too many
    // used to silently delete the position
    removeDishPopup: {
      isOpened: false,
      dishID: null,
      dishName: "",
    },
    basket: {},
    pubID: null,
  },

  reducers: {
    clearBasket(state) {
      state.basket = {};
      state.pubID = null;
    },
    // The texts are part of the payload so the same popup can also ask
    // "empty the whole basket?" from the basket screen
    openClearBasketPopup(state, action) {
      state.clearBasketPopup.isOpened = true;

      if (action?.payload?.text) state.clearBasketPopup.text = action.payload.text;
      if (action?.payload?.okButtonText)
        state.clearBasketPopup.okButtonText = action.payload.okButtonText;
      if (action?.payload?.cancelButtonText)
        state.clearBasketPopup.cancelButtonText = action.payload.cancelButtonText;
    },
    closeClearBasketPopup(state) {
      state.clearBasketPopup.confirmingAction = null;
      state.clearBasketPopup.text = "basket_popup.another_pub_warning";
      state.clearBasketPopup.okButtonText = "basket_popup.ok_button";
      state.clearBasketPopup.cancelButtonText = "basket_popup.cancel_button";
      state.clearBasketPopup.isOpened = false;
    },
    doClearPopupConfirmingAction(state) {
      state.basket = {};

      if (!state.clearBasketPopup.confirmingAction) {
        state.pubID = null;
        return;
      }

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
    openRemoveDishPopup(state, action) {
      state.removeDishPopup.isOpened = true;
      state.removeDishPopup.dishID = action.payload?.dishID ?? null;
      state.removeDishPopup.dishName = action.payload?.dishName ?? "";
    },
    closeRemoveDishPopup(state) {
      state.removeDishPopup.isOpened = false;
      state.removeDishPopup.dishID = null;
      state.removeDishPopup.dishName = "";
    },
    removeDish(state, action) {
      const id = +action.payload?.id;
      if (!id) return;

      delete state.basket[id];

      if (Object.keys(state.basket).length === 0) state.pubID = null;
    },
    increaseDish(state, action) {
      const id = +action.payload?.id;
      if (!id) return;

      const pubID = action.payload?.pubID;
      if (!pubID) return;

      // If the dish is from another pub
      if (state.pubID && state.pubID !== pubID) {
        state.clearBasketPopup.isOpened = true;
        state.clearBasketPopup.text = "basket_popup.another_pub_warning";
        state.clearBasketPopup.okButtonText = "basket_popup.ok_button";
        state.clearBasketPopup.cancelButtonText = "basket_popup.cancel_button";
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
  removeDish,
  openRemoveDishPopup,
  closeRemoveDishPopup,
  openClearBasketPopup,
  closeClearBasketPopup,
  doClearPopupConfirmingAction,
  setBasket,
  clearBasket,
} = basketSlice.actions;

export const selectBasket = (state) => state.basket.basket;
export const selectBasketPubID = (state) => state.basket.pubID;
export const selectDishFromBasket = (id) => (state) =>
  state.basket.basket[id] || null;
export const selectClearBasketPopup = (state) => state.basket.clearBasketPopup;
export const selectRemoveDishPopup = (state) => state.basket.removeDishPopup;

export default basketSlice.reducer;
