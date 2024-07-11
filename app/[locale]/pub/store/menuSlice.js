import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    menuID: null,
};

const menuSlice = createSlice({
    name: "menuSlice",
    initialState,
    reducers: {
        setMenuID(state, action) {
            state.menuID = action.payload;
        },
    },
});

export const selectMenuID = (state) => state.menuSlice.menuID;

export const { setMenuID } = menuSlice.actions;

export default menuSlice.reducer;
