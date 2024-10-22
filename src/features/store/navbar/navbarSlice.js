import { createSlice } from "@reduxjs/toolkit";

export const navbarSlice = createSlice({
  name: "navbar",
  initialState: {
    isEnabled: true,
    expanded: false
  },
  reducers: {
    disableNavbar(state) {
      state.isEnabled = false;
    },
    enableNavbar(state) {
      state.isEnabled = true;
    },
    setNavbarExpanded(state, action) {
      state.expanded = action.payload
    },
    
  },
});

export const { setNavbarExpanded, enableNavbar, disableNavbar } = navbarSlice.actions;

export const selectNavbarIsEnabled = (state) => state.navbar.isEnabled;
export const selectNavbarExpanded = (state) => state.navbar.expanded

export default navbarSlice.reducer;
