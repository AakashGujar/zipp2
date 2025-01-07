import { AppDispatch } from "../store/store";
import { login, logout, setLoading } from "../store/slice";
import { AxiosError } from "axios";
import { api } from "../handlers/handlers";

interface ApiErrorResponse {
  message: string;
  status?: number;
}

export const checkAndRestoreUser = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await api.get('/auth/verify');
      
      if (response.data.user) {
        dispatch(login({ 
          user: response.data.user,
          token: document.cookie.split(';')
            .find(c => c.trim().startsWith('jwt='))
            ?.split('=')[1] || ''
        }));
      }
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      if (err.response?.status === 401) {
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        dispatch(logout());
      }
    } finally {
      dispatch(setLoading(false));
    }
  };
};