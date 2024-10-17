import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    courierInfoPopup: {
        opened: false,
        courier: null
    },
};

const courierInfoPopupSlice = createSlice({
    name: "courierInfoPopupSlice",
    initialState,
    reducers: {
        openCourierInfoPopup(state, action) {
            state.courierInfoPopup.courier = action.payload.courier;
            state.courierInfoPopup.opened = true;
        },
        closeCourierInfoPopup(state) {
            state.courierInfoPopup.opened = false;
            state.courierInfoPopup.courier = null;
        },
    },
});

export const selectCourierInfoPopupState = (state) => state.courierInfoPopupSlice.courierInfoPopup;

export const {openCourierInfoPopup, closeCourierInfoPopup } = courierInfoPopupSlice.actions;

export default courierInfoPopupSlice.reducer;
