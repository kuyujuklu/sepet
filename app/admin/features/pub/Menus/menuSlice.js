import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    menuID: null,
    createPopup: {
        opened: false,
        companyID: null,
        pubID: null,
        place: null
    },
    updatePopup: {
        opened: false,
        companyID: null,
        pubID: null,
        menuID: null,
        initialMenu: null,
    },
    deletePopup: {
        opened: false,
        companyID: null,
        pubID: null,
        menuID: null,
    },
};

const menuSlice = createSlice({
    name: "menuSlice",
    initialState,
    reducers: {
        setMenuID(state, action) {
            state.menuID = action.payload;
        },
        openCreateMenuPopup(state, action) {
            if (!action.payload?.companyID || !action.payload?.pubID || !action.payload?.place) {
                return;
            }
            state.createPopup.companyID = action.payload.companyID;
            state.createPopup.pubID = action.payload.pubID;
            state.createPopup.place = action.payload.place;
            state.createPopup.opened = true;
        },
        closeCreateMenuPopup(state) {
            state.createPopup.opened = false;
            state.createPopup.companyID = null;
            state.createPopup.pubID = null;
        },

        openUpdateMenuPopup(state, action) {
            if (!action.payload.companyID || !action.payload.pubID || !action.payload.menuID || !action.payload.initialMenu) {
                return;
            }
            state.updatePopup.initialMenu = action.payload.initialMenu;
            state.updatePopup.companyID = action.payload.companyID;
            state.updatePopup.pubID = action.payload.pubID;
            state.updatePopup.menuID = action.payload.menuID;
            state.updatePopup.opened = true;
        },
        closeUpdateMenuPopup(state) {
            state.updatePopup.opened = false;
            state.updatePopup.companyID = null;
            state.updatePopup.pubID = null;
            state.createPopup.menuID = null;
        },

        openDeleteMenuPopup(state, action) {
            if (!action.payload.companyID || !action.payload.pubID || !action.payload.menuID) {
                return;
            }
            state.deletePopup.companyID = action.payload.companyID;
            state.deletePopup.pubID = action.payload.pubID;
            state.deletePopup.menuID = action.payload.menuID;
            state.deletePopup.opened = true;
        },
        closeDeleteMenuPopup(state) {
            state.deletePopup.opened = false;
            state.deletePopup.companyID = null;
            state.deletePopup.pubID = null;
            state.createPopup.menuID = null;
        },

    },
});

export const selectMenuID = (state) => state.menuSlice.menuID;
export const selectCreateMenuPopupState = (state) => state.menuSlice.createPopup;
export const selectUpdateMenuPopupState = (state) => state.menuSlice.updatePopup;
export const selectDeleteMenuPopupState = (state) => state.menuSlice.deletePopup;

export const { openCreateMenuPopup, closeCreateMenuPopup, openUpdateMenuPopup, closeUpdateMenuPopup, openDeleteMenuPopup, closeDeleteMenuPopup, setMenuID } = menuSlice.actions;

export default menuSlice.reducer;
