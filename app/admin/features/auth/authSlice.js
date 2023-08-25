import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    authenticated: true,
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
    },
})

export const selectAuthenticated = (state) => state.authentication.authenticated

export const { setAuthenticated, requireAuthentication, setRequireAuthenticationToFalse, setResetPasswordStatus } = authenticationSlice.actions

export default authenticationSlice.reducer