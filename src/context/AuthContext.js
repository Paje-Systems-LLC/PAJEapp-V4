import { createContext, useState, useEffect } from 'react';
import * as authService from '../services/auth';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser]               = useState(null);
    const [sessionToken, setSessionToken] = useState(null);
    const [loading, setLoading]         = useState(true);

    // Bootstrapping: restore JWT from SecureStore
    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const token = await authService.getAuthToken();
                if (token) {
                    api.defaults.headers.Authorization = `Bearer ${token}`;
                    setSessionToken(token);
                    // Decodifica JWT para restaurar dados do usuário sem nova chamada de rede
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setUser({
                            token,
                            email:     payload.email    || payload.sub || '',
                            username:  payload.username || payload.email || payload.sub || '',
                            firstName: payload.first_name || payload.given_name || '',
                            lastName:  payload.last_name  || payload.family_name || '',
                        });
                    } catch {
                        setUser({ token });
                    }
                }
            } catch (e) {
                console.error("Token restoration failed", e);
            } finally {
                setLoading(false);
            }
        };
        bootstrapAsync();
    }, []);

    const login = async (email, password) => {
        const result = await authService.login(email, password);
        if (result.success) {
            const { access_token, user: ssoUser } = result.data;
            setSessionToken(access_token);
            setUser({
                token:     access_token,
                email:     ssoUser?.email      || email,
                username:  ssoUser?.username   || ssoUser?.email || email,
                firstName: ssoUser?.first_name || ssoUser?.given_name  || '',
                lastName:  ssoUser?.last_name  || ssoUser?.family_name || '',
            });
            api.defaults.headers.Authorization = `Bearer ${access_token}`;
            return { success: true };
        }
        return { success: false, error: result.message };
    };

    const register = async (email, password, firstName, lastName, phone = '', consentData = null) => {
        try {
            const payload = { email, password, first_name: firstName, last_name: lastName };
            if (phone) payload.phone_number = phone;
            const result = await api.post('/account/api/register/', payload);
            // Auto-login após cadastro bem-sucedido
            if (result.data?.access_token) {
                const { access_token } = result.data;
                await authService.login(email, password);
                setSessionToken(access_token);
                setUser({ token: access_token, email });
                api.defaults.headers.Authorization = `Bearer ${access_token}`;
                // Registrar consentimentos no SSO (LGPD)
                if (consentData) {
                    try {
                        const SSO_URL = process.env.EXPO_PUBLIC_SSO_URL || 'https://sso.pajesystems.com';
                        await fetch(`${SSO_URL}/auth/v1/consent`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
                            body: JSON.stringify(consentData),
                        });
                    } catch (e) {
                        console.warn('[Consent] Failed to record consent:', e.message);
                    }
                }
            }
            return { success: true, data: result.data };
        } catch (error) {
            const data = error.response?.data;
            let errorMsg = "Erro desconhecido de rede.";
            if (data) {
                if (typeof data === 'string') errorMsg = data;
                else if (data.error)             errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
                else if (data.detail)            errorMsg = data.detail;
                else if (data.non_field_errors)  errorMsg = data.non_field_errors.join(' ');
                else errorMsg = Object.entries(data).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`).join('\n');
            } else if (error.message) {
                errorMsg = error.message;
            }
            return { success: false, error: errorMsg };
        }
    };

    const logout = async () => {
        await authService.logout();
        setSessionToken(null);
        setUser(null);
        delete api.defaults.headers.Authorization;
    };

    return (
        <AuthContext.Provider value={{ user, sessionToken, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
