import { configureStore, combineReducers } from "@reduxjs/toolkit";
import agentAuthReducer from "./features/scheme/agentAuthSlice";
import agentStoreReducer from "./features/scheme/agentStoreSlice";
import enrollmentDraftReducer from "./features/scheme/enrollmentDraftSlice";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
  agentAuth: agentAuthReducer,
  agentStore: agentStoreReducer,
  enrollmentDraft: enrollmentDraftReducer,
});

const persistConfig = {
  key: "agent-root",
  storage,
  whitelist: ["agentAuth", "agentStore", "enrollmentDraft",], // persist both
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const agentStore = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const agentPersistor = persistStore(agentStore);