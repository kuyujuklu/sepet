import { createSlice } from "@reduxjs/toolkit";

// A lightweight, local-only sense of "what did I order before" - not real
// order history (that lives on the backend, behind an account this app
// doesn't have yet), just a receipt trail kept in this browser so a client
// isn't left with literally nothing after checkout.
const MAX_ORDER_HISTORY = 5;

const initialState = {
    pubID: null,
    dishes: {},
    orderHistory: [],
};

const basketSlice = createSlice({
    name: "basketSlice",
    initialState,
    reducers: {
        increaseDishAmount(state, action) {
            if (!action.payload?.dishID) return;

            if (
                !state.dishes[action.payload.dishID] ||
                !state.dishes[action.payload.dishID].count
            ) {
                state.dishes[action.payload.dishID] = {
                    pubID: state.pubID,
                    count: 1,
                };
            } else {
                state.dishes[action.payload.dishID].count++;
            }

            //clear state from null or 0 values
            let keys = Object.keys(state.dishes);
            for (let key of keys) {
                if (
                    !state.dishes[key] ||
                    !state.dishes[key].count ||
                    state.dishes[key].pubID !== state.pubID
                ) {
                    delete state.dishes[key];
                }
            }
        },
        decreaseDishAmount(state, action) {
            if (!action.payload?.dishID) return;

            if (
                !state.dishes[action.payload.dishID] ||
                !state.dishes[action.payload.dishID].count
            ) {
                state.dishes[action.payload.dishID] = {
                    pubID: state.pubID,
                    count: 0,
                };
            } else {
                state.dishes[action.payload.dishID].count--;
            }

            //clear state from null or 0 values
            let keys = Object.keys(state.dishes);
            for (let key of keys) {
                if (
                    !state.dishes[key] ||
                    !state.dishes[key].count ||
                    state.dishes[key].pubID !== state.pubID
                ) {
                    delete state.dishes[key];
                }
            }
        },
        clearBasket(state) {
            state.dishes = {};
        },
        setBasketPubID(state, action) {
            state.pubID = action.payload;

            //clear state from null or 0 values
            let keys = Object.keys(state.dishes);
            for (let key of keys) {
                if (
                    !state.dishes[key] ||
                    !state.dishes[key].count ||
                    state.dishes[key].pubID !== state.pubID
                ) {
                    delete state.dishes[key];
                }
            }
        },
        // A freshly-placed order - newest first, de-duped by id (a redundant
        // dispatch for the same order is a no-op reorder, not a duplicate
        // entry), capped so this can't grow without bound in localStorage.
        addOrderToHistory(state, action) {
            const order = action.payload.order
            if (!order?.id) return;

            state.orderHistory = [order, ...state.orderHistory.filter((o) => o.id !== order.id)].slice(0, MAX_ORDER_HISTORY)
        },
        // Full replace - the hydration path (BasketPreloader reading back
        // whatever was already in localStorage), not an incremental change.
        setOrderHistory(state, action) {
            state.orderHistory = Array.isArray(action.payload) ? action.payload : []
        },
        setBasket(state, action) {
            state.dishes = action.payload
            console.log("new basekt: ", state.basket)
        },
    },
});

export const selectDish = (dishID) => (state) =>
    state.basketSlice.dishes[dishID];
export const selectDishes = (state) => state.basketSlice.dishes;
export const selectBasketCount = (state) =>
    Object.values(state.basketSlice.dishes).reduce((acc, dish) => acc + (dish?.count ?? 0), 0);

export const selectOrderHistory = (state) => state.basketSlice.orderHistory

export const { increaseDishAmount, decreaseDishAmount, clearBasket, setBasketPubID, addOrderToHistory, setOrderHistory, setBasket} =
    basketSlice.actions;

export default basketSlice.reducer;
