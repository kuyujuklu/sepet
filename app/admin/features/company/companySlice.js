import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    companyID: null,
};

const companySlice = createSlice({
    name: "companySlice",
    initialState,
    reducers: {
        setCompanyID(state, action) { 
            state.companyID = action.payload;
        },
    },
});

export const selectCompanyID = (state) => state.companySlice.companyID;
export const  {setCompanyID } = companySlice.actions;

export default companySlice.reducer;
