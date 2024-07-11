import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: null,
};

const pubInfoSlice = createSlice({
    name: "pubInfoSlice",
    initialState,
    reducers: {
        setData(state, action) {
            let pub = {}
            if(action.payload.pub)
            {
                pub = {...action.payload.pub}
                pub.real_id = action.payload.pub.id
                pub.id = action.payload.pub.url_name 
            }
            state.data = {...action.payload};
            state.data.pub = pub;
        },
    },
});

export const selectData = (state) => state.pubInfoSlice.data;

export const { setData } = pubInfoSlice.actions;

export default pubInfoSlice.reducer;
