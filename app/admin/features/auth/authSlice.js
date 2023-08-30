import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    authenticated: true,
    requireAuthentication: false,
}

const authenticationSlice = createSlice({
    name: "authentication",
    initialState,
    reducers: {
        setAuthenticated(state, action) {
            state.authenticated = action.payload
        },
        requireAuthentication(state) {
            state.requireAuthentication = true;
        },
        setRequireAuthenticationToFalse(state) {
            state.requireAuthentication = false;
        }
    },
})

export const selectAuthenticated = (state) => state.authentication.authenticated
export const selectIsRequiringAuthentication = (state) => state.authentication.requireAuthentication

export const { setAuthenticated, requireAuthentication, setRequireAuthenticationToFalse, setResetPasswordStatus } = authenticationSlice.actions

export default authenticationSlice.reducer