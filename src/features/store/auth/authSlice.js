import { createSlice } from '@reduxjs/toolkit'

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthRequiredAtApplicationStart: true,
    isRequiringAuthentication: false,
  },
  reducers: {    
    setIsRequiringAuthentication(state, action) {
        state.isRequiringAuthentication = !!action.payload;
    }
  },
})

export const { setIsRequiringAuthentication } = authSlice.actions

export const authSelectSetIsRequiringAuthentication = (state) => state.auth.isRequiringAuthentication
export const authSelectIsAuthRequiredAtApplicationStart = (state) => state.auth.isAuthRequiredAtApplicationStart

export default authSlice.reducer
