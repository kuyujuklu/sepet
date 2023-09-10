import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: null,
};

const pubInfoSlice = createSlice({
    name: "pubInfoSlice",
    initialState,
    reducers: {
        setData(state, action) {
            state.data = action.payload;
        },
    },
});

export const selectData = (state) => state.pubInfoSlice.data;

export const { setData } = pubInfoSlice.actions;

export default pubInfoSlice.reducer;
