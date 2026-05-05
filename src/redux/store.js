import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { rootPersistConfig } from "./persist";

import userReducer from "./features/user/userSlice";
import cartReducer from "./features/cart/cartSlice";
import wishlistReducer from "./features/wishlist/wishlistSlice";
import recentlyViewedReducer from "./features/recentlyViewed/recentlyViewedSlice";
import customerReducer from "./features/scheme/customerSlice";
import enrollmentReducer from "./features/scheme/enrollmentSlice";
import enrollmentDraftReducer from "./features/scheme/enrollmentDraftSlice";
import agentAuthReducer from "./features/scheme/agentAuthSlice";
import agentStoreReducer from "./features/scheme/agentStoreSlice";

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  recentlyViewed: recentlyViewedReducer,
  customer: customerReducer,
  enrollment: enrollmentReducer,
  enrollmentDraft: enrollmentDraftReducer,
  agentAuth: agentAuthReducer,
  agentStore: agentStoreReducer,
});

const persistedReducer = persistReducer(
  rootPersistConfig,
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);