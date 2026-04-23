import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  referralLink: "",
  referralLoading: false,
  referralError: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
    setReferralLoading: (state, action) => {
      state.referralLoading = action.payload;
    },
    setReferralLink: (state, action) => {
      state.referralLink = action.payload;
      state.referralError = null;
    },
    setReferralError: (state, action) => {
      state.referralError = action.payload;
    },
  },
});

export const { login, logout, setAvatar, setReferralLoading, setReferralLink, setReferralError } = userSlice.actions;
export default userSlice.reducer;

export const selectUser = (state) => state.user.user;
export const selectIsAuthenticated = (state) =>
  state.user.isAuthenticated;