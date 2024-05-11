import { createSlice } from "@reduxjs/toolkit";

export const soundNames = {
    newOrderSound: "new_order_sound",
};

const initialState = {
    playingSounds: Object.values(soundNames).reduce((result, soundName) => {
        result[soundName] = false;
        return result;
    }, {}),
};

export const soundSlice = createSlice({
    name: "sound",
    initialState,
    reducers: {
        setSoundToPlayed(state, action) {
            if(!action.payload) return;
            if(state.playingSounds[action.payload] === undefined) return;

            state.playingSounds[action.payload] = false;
        },
        playSound(state, action) {
            if(!action.payload) return;
            if(state.playingSounds[action.payload] === undefined) return;

            state.playingSounds[action.payload] = true;
        }
    },
});

export const {playSound, setSoundToPlayed} = soundSlice.actions;

export const selectPlayingSounds = (state) => state.sound.playingSounds

export default soundSlice.reducer;
