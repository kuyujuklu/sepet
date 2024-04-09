import { createSlice } from '@reduxjs/toolkit'

export const navbarSlice = createSlice({
  name: 'navbar',
  initialState: {
    isEnabled: true,
  },
  reducers: {
    disableNavbar(state) {
        state.isEnabled = false;
    },
    enableNavbar(state) {
        state.isEnabled = true;
    },
  },
})

export const { enableNavbar, disableNavbar} = navbarSlice.actions

export const navbarSelectIsEnabled = (state) => state.navbar.isEnabled

export default navbarSlice.reducer
