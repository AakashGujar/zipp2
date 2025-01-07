import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AuthState,
  User,
  AnalyticsData,
  AnalyticsState,
  UrlState,
  Url,
} from "../types/utils";

const initialAuthState: AuthState = {
  isLoggedIn: false,
  user: null,
  token: null,
};

const initialAnalyticsState: AnalyticsState = {
  data: null,
  loading: false,
  error: null,
};

const initialUrlState: UrlState = {
  urls: [],
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token?: string }>) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
    },
    signup: (state, action: PayloadAction<{ user: User }>) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
});

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: initialAnalyticsState,
  reducers: {
    setAnalytics(state, action: PayloadAction<AnalyticsData>) {
      state.data = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

const urlSlice = createSlice({
  name: "urls",
  initialState: initialUrlState,
  reducers: {
    setUrls(state, action: PayloadAction<Array<Url>>) {
      state.urls = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    addUrl(state, action: PayloadAction<Url>) {
      state.urls.push(action.payload);
    },
    removeUrl(state, action: PayloadAction<number>) {
      state.urls = state.urls.filter((url) => url.id !== action.payload);
    },
  },
});

export const { login, signup, logout } = authSlice.actions;
export const { setAnalytics, setLoading, setError } = analyticsSlice.actions;
export const {
  setUrls,
  setLoading: setUrlLoading,
  setError: setUrlError,
  addUrl,
  removeUrl,
} = urlSlice.actions;

export const authReducer = authSlice.reducer;
export const analyticsReducer = analyticsSlice.reducer;
export const urlReducer = urlSlice.reducer;