import { createSlice } from "@reduxjs/toolkit";

export const errorKeys = {
  //authentication
  registration: "registration",
  authentication: "authentication",
  registrationValidation: "registration_validation",
  authenticationValidation: "authentication_validation",

  getClient: "client.get_client",

  //orders
  createOrderError: "orders.createOrderError",
};

const initialState = {
  standardHandlingError: null,
  errors: {
    [errorKeys.registration]: null,
    [errorKeys.authentication]: null,
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
    },
    pushError(state, action) {
      const errorKey = action.payload.errorKey;
      if (!errorKey) return;
      state.errors[errorKey] = action.payload.error ?? null;
    },
  },
});

export const selectStandardHandlingError = (state) =>
  state.errorHandling.standardHandlingError;

export const selectError = (errorKey) => (state) =>
  state.errorHandling.errors[errorKey];

export const { handleErrorStandard, pushError } = errorHandlerSlice.actions;

export default errorHandlerSlice.reducer;
