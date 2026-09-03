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
    bulkPricePopup: {
        opened: false,
        companyID: null,
        pubID: null,
        menuID: null,
        categoryID: null,
        categoryName: null,
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
            state.deletePopup.categoryID = action.payload.categoryID;
            state.deletePopup.opened = true;
        },
        closeDeleteCategoryPopup(state) {
            state.deletePopup.opened = false;
            state.deletePopup.companyID = null;
            state.deletePopup.pubID = null;
            state.deletePopup.menuID = null;
            state.deletePopup.categoryID = null;
        },

        openBulkPricePopup(state, action) {
            if (!action.payload.companyID || !action.payload.pubID || !action.payload.menuID || !action.payload.categoryID) {
                return;
            }
            state.bulkPricePopup.companyID = action.payload.companyID;
            state.bulkPricePopup.pubID = action.payload.pubID;
            state.bulkPricePopup.menuID = action.payload.menuID;
            state.bulkPricePopup.categoryID = action.payload.categoryID;
            state.bulkPricePopup.categoryName = action.payload.categoryName ?? null;
            state.bulkPricePopup.opened = true;
        },
        closeBulkPricePopup(state) {
            state.bulkPricePopup.opened = false;
            state.bulkPricePopup.companyID = null;
            state.bulkPricePopup.pubID = null;
            state.bulkPricePopup.menuID = null;
            state.bulkPricePopup.categoryID = null;
            state.bulkPricePopup.categoryName = null;
        },
    },
});

export const selectCategoryID = (state) => state.categorySlice.menuID;
export const selectCreateCategoryPopupState = (state) => state.categorySlice.createPopup;
export const selectUpdateCategoryPopupState = (state) => state.categorySlice.updatePopup;
export const selectDeleteCategoryPopupState = (state) => state.categorySlice.deletePopup;
export const selectBulkPricePopupState = (state) => state.categorySlice.bulkPricePopup;

export const { openCreateCategoryPopup, closeCreateCategoryPopup, openUpdateCategoryPopup, closeUpdateCategoryPopup, openDeleteCategoryPopup, closeDeleteCategoryPopup, openBulkPricePopup, closeBulkPricePopup, setCategoryID } = categorySlice.actions;

export default categorySlice.reducer;
