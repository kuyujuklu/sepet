import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    menuID: null,
    createPopup: {
        opened: false,
        companyID: null,
        pubID: null,
        menuID: null,
        place: null
    },
    updatePopup: {
        opened: false,
        companyID: null,
        pubID: null,
        menuID: null,
        categoryID: null,
        initialCategory: null,
    },
    deletePopup: {
        opened: false,
        companyID: null,
        pubID: null,
        menuID: null,
        categoryID: null,
    },
};

const categorySlice = createSlice({
    name: "categorySlice",
    initialState,
    reducers: {
        setCategoryID(state, action) {
            state.menuID = action.payload;
        },
        openCreateCategoryPopup(state, action) {
            if (!action.payload?.companyID || !action.payload?.pubID || !action.payload.menuID || !action.payload?.place) {
                return;
            }
            state.createPopup.companyID = action.payload.companyID;
            state.createPopup.pubID = action.payload.pubID;
            state.createPopup.menuID = action.payload.menuID;
            state.createPopup.place = action.payload.place;
            state.createPopup.opened = true;
        },
        closeCreateCategoryPopup(state) {
            state.createPopup.opened = false;
            state.createPopup.companyID = null;
            state.createPopup.pubID = null;
            state.createPopup.menuID = null;
        },

        openUpdateCategoryPopup(state, action) {
            if (!action.payload.companyID || !action.payload.pubID || !action.payload.menuID || !action.payload.categoryID || !action.payload.initialCategory) {
                return;
            }
            state.updatePopup.initialCategory = action.payload.initialCategory;
            state.updatePopup.companyID = action.payload.companyID;
            state.updatePopup.pubID = action.payload.pubID;
            state.updatePopup.menuID = action.payload.menuID;
            state.updatePopup.categoryID = action.payload.categoryID;
            state.updatePopup.opened = true;
        },
        closeUpdateCategoryPopup(state) {
            state.updatePopup.opened = false;
            state.updatePopup.companyID = null;
            state.updatePopup.pubID = null;
            state.updatePopup.menuID = null;
            state.updatePopup.categoryID = null;
        },

        openDeleteCategoryPopup(state, action) {
            if (!action.payload.companyID || !action.payload.pubID || !action.payload.menuID  || !action.payload.categoryID) {
                return;
            }
            state.deletePopup.companyID = action.payload.companyID;
            state.deletePopup.pubID = action.payload.pubID;
            state.deletePopup.menuID = action.payload.menuID;
            state.deletePopup.opened = true;
        },
        closeDeleteCategoryPopup(state) {
            state.deletePopup.opened = false;
            state.deletePopup.companyID = null;
            state.deletePopup.pubID = null;
            state.deletePopup.menuID = null;
            state.deletePopup.categoryID = null;
        },

    },
});

export const selectCategoryID = (state) => state.categorySlice.menuID;
export const selectCreateCategoryPopupState = (state) => state.categorySlice.createPopup;
export const selectUpdateCategoryPopupState = (state) => state.categorySlice.updatePopup;
export const selectDeleteCategoryPopupState = (state) => state.categorySlice.deletePopup;

export const { openCreateCategoryPopup, closeCreateCategoryPopup, openUpdateCategoryPopup, closeUpdateCategoryPopup, openDeleteCategoryPopup, closeDeleteCategoryPopup, setCategoryID } = categorySlice.actions;

export default categorySlice.reducer;
