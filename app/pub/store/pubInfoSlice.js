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
            console.log("URL_NAME ++++++++++++++", action.payload.pub.url_name)
            if(state.data.pub)
                state.data.pub.id = action.payload.pub.url_name;
        },
    },
});

export const selectData = (state) => state.pubInfoSlice.data;

export const { setData } = pubInfoSlice.actions;

export default pubInfoSlice.reducer;
