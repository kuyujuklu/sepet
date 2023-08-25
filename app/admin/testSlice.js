import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    counter: 0,
};

const testSlice = createSlice({
    name: "test",
    initialState,
    reducers: {
        increment: (state) => {
            state.counter += 1;
        }
    },
});


export const {
    increment,
} = testSlice.actions;

export default testSlice.reducer;
