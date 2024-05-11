import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    isLoaded: false,
    loadError: null,
}

const googleMapSlice = createSlice({
    name: "googleMaps",
    initialState,
    reducers: {
        setIsLoaded(state, action) {
            state.isLoaded = action.payload
        },
        setLoadError(state, action) {
            state.loadError = action.payload
        }
    },
})

export const googleMapSelectIsLoaded = (state) => state.googleMaps.isLoaded
export const googleMapSelctLoadError = (state) => state.googleMaps.loadError

export const { setIsLoaded: googleMapsApiSetIsLoaded, setLoadError: googleMapsApiSetLoadError } = googleMapSlice.actions

export default googleMapSlice.reducer