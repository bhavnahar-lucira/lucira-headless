import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  isAuthDialogOpen: false,
  pincode: "",
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
      state.isAuthDialogOpen = false;
    },
    setPincode: (state, action) => {
      state.pincode = action.payload;
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
    openAuthDialog: (state) => {
      state.isAuthDialogOpen = true;
    },
    closeAuthDialog: (state) => {
      state.isAuthDialogOpen = false;
    },
  },
});

export const { 
  login, 
  setPincode, 
  logout, 
  setAvatar, 
  setReferralLoading, 
  setReferralLink, 
  setReferralError,
  openAuthDialog,
  closeAuthDialog
} = userSlice.actions;
export default userSlice.reducer;

export const selectUser = (state) => state.user.user;
export const selectIsAuthenticated = (state) =>
  state.user.isAuthenticated;
export const selectIsAuthDialogOpen = (state) =>
  state.user.isAuthDialogOpen;