import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    pubID: null,
    dishes: {},
    lastOrder: null,
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
        setLastOrder(state, action) {
            const order = action.payload.order
            if(!order) return;

            state.lastOrder = order
        }
    },
});

export const selectDish = (dishID) => (state) =>
    state.basketSlice.dishes[dishID];
export const selectDishes = (state) => state.basketSlice.dishes;

export const selectLastOrder = (state) => state.basketSlice.lastOrder

export const { increaseDishAmount, decreaseDishAmount, clearBasket, setBasketPubID, setLastOrder } =
    basketSlice.actions;

export default basketSlice.reducer;
