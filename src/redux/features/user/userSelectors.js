export const selectUser = (state) => state.user.user;
export const selectIsAuthenticated = (state) =>
  state.user.isAuthenticated;
export const selectIsAuthDialogOpen = (state) =>
  state.user.isAuthDialogOpen;