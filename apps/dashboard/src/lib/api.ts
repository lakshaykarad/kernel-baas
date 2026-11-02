import axios from 'axios'; 

export const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials : true,
});

let accessToken : string | null = null;

export const setAccessToken = (token: string) => {
    accessToken = token;
}

api.interceptors.request.use((config) =>{
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Get new access_token from cookies if a 401 happens.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const res = await api.post('/auth/refresh');
        setAccessToken(res.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);