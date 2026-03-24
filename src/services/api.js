import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { refreshAccessToken } from './auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.pajesystems.com';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor: Inject Bearer JWT
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.error("Error retrieving token from SecureStore", e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Auto-refresh JWT on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            const newToken = await refreshAccessToken();
            if (newToken) {
                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
