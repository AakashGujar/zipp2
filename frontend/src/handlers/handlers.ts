import axios, { AxiosError } from "axios";
import { AppDispatch } from "../store/store";
import {
  setLoading,
  setAnalytics,
  setUrls,
  addUrl,
  removeUrl,
  signup,
  login,
  logout,
} from "../store/slice";
import { backendUrl } from "../utils/utils";
import { AnalyticsData, User } from "../types/utils";
import { toast } from "sonner";

interface ApiErrorResponse {
  message: string;
  status?: number;
}

export const api = axios.create({
  baseURL: backendUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const handleSignup = async (
  dispatch: AppDispatch,
  data: { name: string; email: string; password: string }
): Promise<void> => {
  try {
    const response = await api.post(`/auth/signup`, data);
    dispatch(
      signup({
        user: response.data.data,
        token: response.data.token,
      })
    );
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    toast.error(err.response?.data?.message || "Signup failed");
  }
};

export const handleLogin = async (
  dispatch: AppDispatch,
  data: { email: string; password: string }
): Promise<User | void> => {
  try {
    const response = await api.post("/auth/signin", data);
    dispatch(
      login({
        user: response.data.user,
        token: response.data.token,
      })
    );
    return response.data.user;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    toast.error(err.response?.data?.message || "Login failed");
  }
};

export const handleLogout = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      await api.get("/auth/logout");
      dispatch(logout());
      toast.success("Logged out successfully");
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      toast.error(err.response?.data?.message || "Failed to logout");
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const handleFetchAnalytics = (urlId: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await api.get<{ data: AnalyticsData }>(
        `/analytics/${urlId}`
      );
      dispatch(setAnalytics(response.data.data));
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      toast.error(
        err.response?.data?.message || "Failed to fetch analytics data"
      );
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const handleShortenUrl = (data: { originalUrl: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await api.post(`/url/shorten`, data);
      dispatch(addUrl(response.data.data));
      toast.success("URL shortened successfully");
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      toast.error(err.response?.data?.message || "Failed to shorten URL");
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const handleFetchUrls = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await api.get(`/url/urls`);
      dispatch(setUrls(response.data.data));
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      toast.error(err.response?.data?.message || "Failed to fetch URLs");
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const handleRedirect = (shortUrl: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await api.get(`/z/${shortUrl}`);
      window.location.href = response.data.data.originalUrl;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      toast.error(err.response?.data?.message || "Failed to redirect");
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const handleDeleteUrl = (urlId: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await api.delete(`/url/${urlId}`);
      if (response.data.data) {
        dispatch(removeUrl(Number(urlId)));
        toast.success("URL deleted successfully");
      }
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      toast.error(err.response?.data?.message || "Failed to delete URL");
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const handleSearchUrls = (query: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await api.get(`/url/search`, { params: { query } });
      dispatch(setUrls(response.data.data));
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      toast.error(err.response?.data?.message || "Failed to search URLs");
    } finally {
      dispatch(setLoading(false));
    }
  };
};
// export const handleLogout = async () => {
//   try {
//     await api.get('/auth/logout');
//     document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict";
//     dispatch(logout());
//   } catch (error) {
//     console.error("Logout failed:", error);
//   }
// };

// export const handleLogout = async (dispatch: AppDispatch): Promise<void> => {
//   try {
//     await api.get("/auth/logout");
//     document.cookie =
//       "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict";
//     dispatch(logout());
//     toast.success("Logged out successfully");
//   } catch (error) {
//     const err = error as AxiosError<ApiErrorResponse>;
//     toast.error(err.response?.data?.message || "Failed to logout");
//   }
// };
