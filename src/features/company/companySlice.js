import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    companyID: null,
    tariffPopup: {
        opened: false,
    },
    payForPubPopup: {
        opened: false,
    }
};

const companySlice = createSlice({
    name: "companySlice",
    initialState,
    reducers: {
        setCompanyID(state, action) { 
            state.companyID = action.payload;
        },
        openTariffPopup(state) {
            state.tariffPopup.opened = true;
        },
        closeTariffPopup(state) {
            state.tariffPopup.opened = false;
        },
        openPayForPubPopup(state) {
            state.payForPubPopup.opened = true;
        },
        closePayForPubPopup(state) {
            state.payForPubPopup.opened = false;
        }
    },
});

export const selectCompanyID = (state) => state.companySlice.companyID;
export const selectUpgradeTariffPopupState = (state) => state.companySlice.tariffPopup;
export const selectPayForPubPopupState = (state) => state.companySlice.payForPubPopup;

export const  {setCompanyID, openTariffPopup, closeTariffPopup, openPayForPubPopup, closePayForPubPopup} = companySlice.actions;

export default companySlice.reducer;
