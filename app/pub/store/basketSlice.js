import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    dishes: {},
};

const basketSlice = createSlice({
    name: "basketSlice",
    initialState,
    reducers: {
        increaseDishAmount(state, action) {
            if(!action.payload?.dishID) return;
            
            if(!state.dishes[action.payload.dishID]) {
                state.dishes[action.payload.dishID] = 1;
                return
            }

            //clear state from null or 0 values
            let keys = Object.keys(state.dishes)
            for(let key of keys) {
                if(!state.dishes[key]) {
                    delete state.dishes[key]
                }
            }

            state.dishes[action.payload.dishID]++;
        },
        decreaseDishAmount(state, action) {
            if(!action.payload?.dishID) return;
            
            if(!state.dishes[action.payload.dishID]) {
                state.dishes[action.payload.dishID] = null;
                return
            }
            //clear state from null or 0 values
            let keys = Object.keys(state.dishes)
            for(let key of keys) {
                if(!state.dishes[key]) {
                    delete state.dishes[key]
                }
            }
            state.dishes[action.payload.dishID]--;
        }
    },
});

export const selectDish = (dishID) => (state) => state.basketSlice.dishes[dishID];
export const selectDishes = (state) => state.basketSlice.dishes;

export const { increaseDishAmount, decreaseDishAmount } = basketSlice.actions;

export default basketSlice.reducer;
