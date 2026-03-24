import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const SSO_URL = process.env.EXPO_PUBLIC_SSO_URL || 'https://sso.pajesystems.com';

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${SSO_URL}/auth/v1/token`, { email, password });
        const { access_token, refresh_token, user } = response.data;
        if (!access_token) {
            return { success: false, message: "Token não retornado pelo SSO." };
        }
        await SecureStore.setItemAsync('userToken', access_token);
        await SecureStore.setItemAsync('refreshToken', refresh_token || '');
        return { success: true, data: { access_token, refresh_token, user } };
    } catch (error) {
        console.error("SSO Login Error:", error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.error || error.response?.data?.message || "Credenciais inválidas.",
        };
    }
};

export const logout = async () => {
    try {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return { success: true };
    } catch (e) {
        console.error("Error during logout", e);
        return { success: false };
    }
};

export const getAuthToken = async () => {
    try {
        return await SecureStore.getItemAsync('userToken');
    } catch (e) {
        return null;
    }
};

export const refreshAccessToken = async () => {
    try {
        const refresh_token = await SecureStore.getItemAsync('refreshToken');
        if (!refresh_token) return null;
        const response = await axios.post(`${SSO_URL}/auth/v1/token/refresh`, { refresh_token });
        const { access_token } = response.data;
        if (access_token) {
            await SecureStore.setItemAsync('userToken', access_token);
        }
        return access_token || null;
    } catch (e) {
        return null;
    }
};
