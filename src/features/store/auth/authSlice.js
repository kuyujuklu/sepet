import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthRequiredAtApplicationStart: true,
    isRequiringAuthentication: false,
    client: {
      phone: "",
    },
    refetchClient: false
  },
  reducers: {
    setIsRequiringAuthentication(state, action) {
      state.isRequiringAuthentication = !!action.payload;
    },
    setClient(state, action) {
      state.client = action.payload;
    },
    setRefetchClient(state,action) {
      state.refetchClient = action.payload;
    }
  },
});

export const { setIsRequiringAuthentication, setClient,setRefetchClient } = authSlice.actions;

export const authSelectSetIsRequiringAuthentication = (state) =>
  state.auth.isRequiringAuthentication;
export const authSelectIsAuthRequiredAtApplicationStart = (state) =>
  state.auth.isAuthRequiredAtApplicationStart;

export const selectClient = (state) => state.auth.client;

export const selectRefetchClient = (state) => state.auth.refetchClient

export default authSlice.reducer;
