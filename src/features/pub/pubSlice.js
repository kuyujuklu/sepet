import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    pubID: null,
    createPopup: {
        opened: false,
        companyID: null,
    },
    updatePopup: {
        opened: false,
        initialPub: null,
    },
    deletePopup: {
        opened: false,
        pubID: null,
        companyID: null,
    },
    qrCodePopup: {
        opened: false,
        imageFileName: null,
        pubURL: null
    }
};

const pubSlice = createSlice({
    name: "pubSlice",
    initialState,
    reducers: {
        setPubID(state, action) {
            state.pubID = action.payload;
        },
        openCreatePubPopup(state, action) {
            if (!action.payload) {
                return;
            }
            state.createPopup.companyID = action.payload;
            state.createPopup.opened = true;
        },
        closeCreatePubPopup(state) {
            state.createPopup.opened = false;
            state.createPopup.companyID = null;
        },

        openUpdatePubPopup(state, action) {
            if (!action.payload) {
                return;
            }
            state.updatePopup.initialPub = action.payload;
            state.updatePopup.opened = true;
        },
        closeUpdatePubPopup(state) {
            state.updatePopup.opened = false;
            state.updatePopup.initialPub = null;
        },

        openDeletePubPopup(state, action) {
            if (!action.payload.companyID || !action.payload.pubID) {
                return;
            }
            state.deletePopup.companyID = action.payload.companyID;
            state.deletePopup.pubID = action.payload.pubID;
            state.deletePopup.opened = true;
        },
        closeDeletePubPopup(state) {
            state.deletePopup.opened = false;
            state.deletePopup.companyID = null;
            state.deletePopup.pubID = null;
        },

        openQrCodePopup(state, action) {
            if (!action.payload) {
                return;
            }
            state.qrCodePopup.imageFileName = action.payload.imageFileName;
            state.qrCodePopup.pubURL = action.payload.pubURL;
            state.qrCodePopup.opened = true;
        },
        closeQrCodePopup(state) {
            state.qrCodePopup.opened = false;
            state.qrCodePopup.imageFileName = null;
        }
    },
});
export const selectPubID = (state) => state.pubSlice.pubID;
export const selectCreatePubPopupState = (state) => state.pubSlice.createPopup;
export const selectUpdatePubPopupState = (state) => state.pubSlice.updatePopup;
export const selectDeletePubPopupState = (state) => state.pubSlice.deletePopup;
export const selectQrCodePopupState = (state) => state.pubSlice.qrCodePopup;

export const {
    openCreatePubPopup,
    closeCreatePubPopup,
    openUpdatePubPopup,
    closeUpdatePubPopup,
    openDeletePubPopup,
    closeDeletePubPopup,
    openQrCodePopup,
    closeQrCodePopup,
    setPubID,
} = pubSlice.actions;

export default pubSlice.reducer;
