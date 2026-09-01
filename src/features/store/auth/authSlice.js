import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthRequiredAtApplicationStart: false,
    isRequiringAuthentication: false,
    client: {
      // The stable analytics id, straight off the client record - not the
      // phone number
      id: null,
      phone: "",
      name: "",
      isGuest: false,
      // The consent record: whether tracking was accepted and for which
      // version of the privacy policy
      analyticsConsent: false,
      consentPolicyVersion: "",
    },
    refetchClient: false,
    deleteClientPopup: {
      opened: false,
    },
  },
  reducers: {
    setIsRequiringAuthentication(state, action) {
      state.isRequiringAuthentication = !!action.payload;
    },
    setClient(state, action) {
      state.client = action.payload;
    },
    // Mirrors what POST /api/client/analytics-consent was told, so the
    // profile toggle repaints without waiting for a refetch
    setAnalyticsConsent(state, action) {
      state.client.analyticsConsent = !!action.payload?.accepted;
      state.client.consentPolicyVersion = action.payload?.policyVersion ?? "";
    },
    setRefetchClient(state, action) {
      state.refetchClient = action.payload;
    },
    openDeleteClientPopup(state) {
      state.deleteClientPopup.opened = true;
    },
    closeDeleteClientPopup(state) {
      state.deleteClientPopup.opened = false;
    },
  },
});

export const {
  setIsRequiringAuthentication,
  setClient,
  setAnalyticsConsent,
  setRefetchClient,
  openDeleteClientPopup,
  closeDeleteClientPopup,
} = authSlice.actions;

export const authSelectSetIsRequiringAuthentication = (state) =>
  state.auth.isRequiringAuthentication;
export const authSelectIsAuthRequiredAtApplicationStart = (state) =>
  state.auth.isAuthRequiredAtApplicationStart;

export const selectClient = (state) => state?.auth.client;

export const selectRefetchClient = (state) => state.auth.refetchClient;

export const selectDeleteClientPopup = (state) => state.auth.deleteClientPopup;

export default authSlice.reducer;
