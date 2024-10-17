import { createSlice } from "@reduxjs/toolkit";

export const alertTypes = {
    success: "success",
    danger: "danger",
    warning: "warning"
}

const initialState = {
    alerts: [],
};

export const alertSlice = createSlice({
    name: 'alert',
    initialState,
    reducers: {
        pushAlert(state, action) {
            const {header, message, type = "warning", delay} = action.payload;

            const id = state.alerts.length === 0 ? 1 : state.alerts[state.alerts.length - 1].id + 1;
            
            state.alerts.push({id, header, message, type, delay});
        },
        removeAlert(state, action){
            const id = action.payload;
            if(!id) return;

            state.alerts = state.alerts.filter(alert => alert.id !== id)
        }
    }
});

export const { pushAlert, removeAlert } = alertSlice.actions;

export const selectAlerts = state => state.alerts.alerts;

export default alertSlice.reducer;