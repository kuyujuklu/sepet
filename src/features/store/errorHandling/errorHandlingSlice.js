import { createSlice } from "@reduxjs/toolkit";

export const errorKeys = {
    //authentication
    registrationData: 'registration_data',
    authenticationData: 'authentication_data',
    registrationValidation: 'registration_validation',
    authenticationValidation: 'authentication_validation',

    getClient: 'client.get_client',

    //orders
    createOrderError: 'orders.createOrderError'
};

const initialState = {
    standardHandlingError: null,
    errors: {
        [errorKeys.registrationData]: null,
        [errorKeys.authenticationData]: null,
        [errorKeys.registrationValidation]: null,
        [errorKeys.authenticationValidation]: null,
        [errorKeys.getClient]: null,
    },
};

const errorHandlerSlice = createSlice({
    name: "errorHandling",
    initialState,
    reducers: {
        handleErrorStandard(state, action) {
            state.standardHandlingError = action.payload ?? null;
            console.log("pushedStandardError ", action.payload);
        },
        pushError(state, action) {
            const errorKey = action.payload.errorKey;
            if(!errorKey) return;
            console.log("setting error key", errorKey, " error ", action.payload.error)
            state.errors[errorKey] = action.payload.error ?? null;
        },
    },
});

export const selectStandardHandlingError = (state) =>
    state.errorHandling.standardHandlingError;

export const selectError = errorKey => state => state.errorHandling.errors[errorKey];

export const {
    handleErrorStandard,
    pushError
} = errorHandlerSlice.actions;

export default errorHandlerSlice.reducer;
