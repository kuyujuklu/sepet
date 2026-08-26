import { createSlice } from "@reduxjs/toolkit";
import { defaultSectionId } from "../../../shared/utils/sections";

// Which top-level section (food / flowers / groceries) the client is browsing.
// Deliberately NOT persisted: the picker is shown on every launch, so the
// choice lives only for the session.
export const sectionSlice = createSlice({
  name: "section",
  initialState: {
    section: null,
  },
  reducers: {
    setSection(state, action) {
      state.section = action.payload ?? null;
    },
  },
});

export const { setSection } = sectionSlice.actions;

// Falls back to food so that a screen opened by a deep link (before the picker
// was ever shown) still has a section to filter with.
export const selectSection = (state) => state.section.section ?? defaultSectionId;

// The raw value - null means "the client has not chosen yet"
export const selectSelectedSection = (state) => state.section.section;

export default sectionSlice.reducer;
