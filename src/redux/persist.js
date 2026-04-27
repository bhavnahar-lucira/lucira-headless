import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

export const rootPersistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["user", "cart", "wishlist", "recentlyViewed"], // persist wishlist and recently viewed list
};

export const persistUserReducer = (reducer) =>
  persistReducer(rootPersistConfig, reducer);