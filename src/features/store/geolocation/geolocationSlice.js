import { createSlice } from '@reduxjs/toolkit'

export const geolocationSlice = createSlice({
  name: 'geolocation',
  initialState: {
    isGeolocationRequested: true,
    geolocation: null,
  },
  reducers: {
    setIsGeolocationRequested: (state, action) => {
        state.isGeolocationRequested = action.payload
    },
    setGeolocation(state, action) {
        state.geolocation = action.payload ?? null
    }
  },
})

export const { setIsGeolocationRequested, setGeolocation } = geolocationSlice.actions

export const selectGeolocation = (state) => state.geolocation.geolocation
export const selectIsGeolocationRequested = (state) => state.geolocation.isGeolocationRequested

export default geolocationSlice.reducer
