import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
};

const slice = createSlice({
  name: "agentAuth",
  initialState,
  reducers: {
    setAgentAuth: (state) => {
      state.isAuthenticated = true;
    },
    logoutAgent: (state) => {
      state.isAuthenticated = false;
    },
  },
});

export const { setAgentAuth, logoutAgent } = slice.actions;
export default slice.reducer;