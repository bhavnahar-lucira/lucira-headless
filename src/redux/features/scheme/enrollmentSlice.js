import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  enrollment: null,
};

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    setEnrollment(state, action) {
      state.enrollment = action.payload;
    },
    clearEnrollment(state) {
      state.enrollment = null;
    },
  },
});

export const { setEnrollment, clearEnrollment } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
