import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    createPopup: {
        opened: false,
        companyID: null,
        pubID: null,
        menuID: null,
        categoryID: null,
        place: null,
    },
    updatePopup: {
        opened: false,
        companyID: null,
        pubID: null,
        menuID: null,
        categoryID: null,
        dishID: null,
        initialDish: null,
        place: null,
    },
    deletePopup: {
        opened: false,
        companyID: null,
        pubID: null,
        menuID: null,
        dishID: null,
        categoryID: null,
    },
};

const dishSlice = createSlice({
    name: "dishSlice",
    initialState,
    reducers: {
        openCreateDishPopup(state, action) {
            if (
                (!action.payload?.companyID ||
                    !action.payload?.pubID ||
                    !action.payload.menuID ||
                    !action.payload.categoryID ||
                !action.payload?.place)
            ) {
                return;
            }
            state.createPopup.companyID = action.payload.companyID;
            state.createPopup.pubID = action.payload.pubID;
            state.createPopup.menuID = action.payload.menuID;
            state.createPopup.categoryID = action.payload.categoryID;
            state.createPopup.place = action.payload.place;
            state.createPopup.opened = true;
        },
        closeCreateDishPopup(state) {
            state.createPopup.opened = false;
            state.createPopup.companyID = null;
            state.createPopup.pubID = null;
            state.createPopup.menuID = null;
            state.createPopup.categoryID = null;
        },

        openUpdateDishPopup(state, action) {
            if (
                !action.payload.companyID ||
                !action.payload.pubID ||
                !action.payload.menuID ||
                !action.payload.categoryID ||
                !action.payload.dishID ||
                !action.payload.initialDish
            ) {
                return;
            }
            state.updatePopup.initialDish = action.payload.initialDish;
            state.updatePopup.companyID = action.payload.companyID;
            state.updatePopup.pubID = action.payload.pubID;
            state.updatePopup.menuID = action.payload.menuID;
            state.updatePopup.categoryID = action.payload.categoryID;
            state.updatePopup.dishID = action.payload.dishID;
            state.updatePopup.place = action.payload.place;
            state.updatePopup.opened = true;
        },
        closeUpdateDishPopup(state) {
            state.updatePopup.opened = false;
            state.updatePopup.companyID = null;
            state.updatePopup.pubID = null;
            state.updatePopup.menuID = null;
            state.updatePopup.categoryID = null;
            state.updatePopup.dishID = null;
            state.updatePopup.initialDish = null;
            state.updatePopup.place = null;
        },

        openDeleteDishPopup(state, action) {
            if (
                !action.payload.companyID ||
                !action.payload.pubID ||
                !action.payload.menuID ||
                !action.payload.categoryID ||
                !action.payload.dishID
            ) {
                return;
            }
            state.deletePopup.companyID = action.payload.companyID;
            state.deletePopup.pubID = action.payload.pubID;
            state.deletePopup.menuID = action.payload.menuID;
            state.deletePopup.categoryID = action.payload.categoryID;
            state.deletePopup.dishID = action.payload.dishID;

            state.deletePopup.opened = true;
        },
        closeDeleteDishPopup(state) {
            state.deletePopup.opened = false;
            state.deletePopup.companyID = null;
            state.deletePopup.pubID = null;
            state.deletePopup.menuID = null;
            state.deletePopup.categoryID = null;
            state.deletePopup.dishID = null;
        },
    },
});

export const selectDishID = (state) => state.dishSlice.menuID;
export const selectCreateDishPopupState = (state) =>
    state.dishSlice.createPopup;
export const selectUpdateDishPopupState = (state) =>
    state.dishSlice.updatePopup;
export const selectDeleteDishPopupState = (state) =>
    state.dishSlice.deletePopup;

export const {
    openCreateDishPopup,
    closeCreateDishPopup,
    openUpdateDishPopup,
    closeUpdateDishPopup,
    openDeleteDishPopup,
    closeDeleteDishPopup,
    setDishID,
} = dishSlice.actions;

export default dishSlice.reducer;
