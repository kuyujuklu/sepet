import { createSlice } from '@reduxjs/toolkit'

export const versionSlice = createSlice({
  name: 'version',
  initialState: {
    version: null,
    isExpired: false,
  },
  reducers: {
    setVersion: (state, action) => {
      console.log("SET VERSION: ", action.payload)
      state.version = action.payload.version;
      state.isExpired = action.payload.isExpired;
    },
  },
})

export const {
  setVersion } = versionSlice.actions

export const selectVersion = (state) => state.version.version;
export const selectIsVersionExpired = (state) => state.version.isExpired;

export default versionSlice.reducer
