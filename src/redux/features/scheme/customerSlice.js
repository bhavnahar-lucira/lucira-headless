import { createSlice } from "@reduxjs/toolkit";

const initialState = { customer: null };

const slice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomer: (s, a) => { s.customer = a.payload; },
    clearCustomer: (s) => { s.customer = null; }
  }
});

export const { setCustomer, clearCustomer } = slice.actions;
export default slice.reducer;
