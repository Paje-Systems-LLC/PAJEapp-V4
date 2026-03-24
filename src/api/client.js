import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Uses same Walled Garden endpoint as services/api.js
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.pajesystems.com';

const client = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Inject auth token on every request
client.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                config.headers.Authorization = `Token ${token}`;
            }
        } catch (e) {
            console.error("client.js: Error retrieving token", e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default client;
