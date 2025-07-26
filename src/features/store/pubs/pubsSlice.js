import { createSlice } from '@reduxjs/toolkit'
import { setPub } from '../linking/linkingSlice'

export const pubSlice = createSlice({
  name: 'pub',
  initialState: {
    value: 0,
    popups: {
      pubNotAvailableForDelivery: {
        isOpened: false,
      }
    },
  },
  reducers: {
    openPubNotAvailableForDeliveryPopup: (state, action) => {
      state.popups.pubNotAvailableForDelivery.isOpened = true
    },
    closePubNotAvailableForDeliveryPopup: (state, action) => {
      state.popups.pubNotAvailableForDelivery.isOpened = false
    },
  },
})

export const {
  openPubNotAvailableForDeliveryPopup, closePubNotAvailableForDeliveryPopup } = pubSlice.actions

export const selectPubNotAvailableForDeliveryPopup = (state) => state.pub.popups.pubNotAvailableForDelivery

export default pubSlice.reducer
