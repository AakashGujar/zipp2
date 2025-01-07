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
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  }
});

export const handleSignup = async (
  dispatch: AppDispatch,
  data: { name: string; email: string; password: string }
): Promise<void> => {
  try {
    const response = await api.post(`/auth/signup`, data);
    dispatch(signup({ user: response.data.data }));
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
    dispatch(login({ user: response.data.user, token: response.data.token }));
    return response.data.user;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    toast.error(err.response?.data?.message || "Login failed");
  }
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
      const response = await api.get(`/${shortUrl}`);
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

export const handleLogout = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      await api.get("/auth/logout");
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
