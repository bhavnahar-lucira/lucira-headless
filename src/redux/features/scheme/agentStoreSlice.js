import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stores: [],
  selectedStore: null,
};

const slice = createSlice({
  name: "agentStore",
  initialState,
  reducers: {
    setAgentStores: (state, action) => {
      state.stores = action.payload;
    },
    setSelectedAgentStore: (state, action) => {
      state.selectedStore = action.payload;
    },
  },
});

export const { setAgentStores, setSelectedAgentStore } = slice.actions;
export default slice.reducer;