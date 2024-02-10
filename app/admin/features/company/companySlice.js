import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    companyID: null,
    tariffPopup: {
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
        }
    },
});

export const selectCompanyID = (state) => state.companySlice.companyID;
export const selectUpgradeTariffPopupState = (state) => state.companySlice.tariffPopup;
export const  {setCompanyID, openTariffPopup, closeTariffPopup } = companySlice.actions;

export default companySlice.reducer;
