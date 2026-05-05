import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: {},   // 👈 This is your draft state
};

const enrollmentDraftSlice = createSlice({
  name: "enrollmentDraft",
  initialState,
  reducers: {
    saveDraft: (state, action) => {
      state.data = action.payload;
    },
    clearDraft: (state) => {
      state.data = {};
    },
  },
});

export const { saveDraft, clearDraft } = enrollmentDraftSlice.actions;
export default enrollmentDraftSlice.reducer;