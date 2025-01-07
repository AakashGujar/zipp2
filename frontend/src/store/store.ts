import { configureStore } from "@reduxjs/toolkit";
import { authReducer, analyticsReducer, urlReducer } from "./slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    url: urlReducer,
    analytics: analyticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
