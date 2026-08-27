import { createSlice } from "@reduxjs/toolkit";

// The list a client sees under "Дополнительные настройки → Уведомления".
// Not persisted in this slice - App.js hydrates it from AsyncStorage on
// launch (shared/utils/pushNotificationsHistory.js owns the storage key), the
// same way saved_addresses is loaded.
export const notificationsHistorySlice = createSlice({
  name: "notificationsHistory",
  initialState: {
    items: [],
  },
  reducers: {
    setNotificationsHistory: (state, action) => {
      state.items = action.payload ?? [];
    },
  },
});

export const { setNotificationsHistory } = notificationsHistorySlice.actions;

export const selectNotificationsHistory = (state) =>
  state.notificationsHistory.items;

export const selectUnreadNotificationsCount = (state) =>
  state.notificationsHistory.items.filter((item) => !item.read).length;

export default notificationsHistorySlice.reducer;
