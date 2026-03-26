/**
 * PAJE Systems — ThemeContext
 *
 * Provê o tema atual e funções para alterá-lo.
 * Persiste a escolha do usuário via AsyncStorage.
 *
 * Uso:
 *   // 1. Envolva o app com ThemeProvider (em App.js)
 *   <ThemeProvider><App /></ThemeProvider>
 *
 *   // 2. Em qualquer tela/componente:
 *   const { T, themeKey, setMode, setScale } = useTheme();
 *   style={{ backgroundColor: T.bg, fontSize: T.font.base }}
 *
 *   // 3. Toggle simples no ConfigurationScreen:
 *   <Switch value={T.isDark} onValueChange={v => setMode(v ? 'dark' : 'light')} />
 *   <Switch value={T.is60}   onValueChange={v => setScale(v ? 'a60' : 'normal')} />
 */

import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from './tokens';

const STORAGE_KEY = '@paje_theme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [mode,  setModeState]  = useState('dark');    // 'dark' | 'light'
    const [scale, setScaleState] = useState('normal');  // 'normal' | 'a60'

    // Restaura preferência salva na inicialização
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then(raw => {
                if (!raw) return;
                const saved = JSON.parse(raw);
                if (saved.mode)  setModeState(saved.mode);
                if (saved.scale) setScaleState(saved.scale);
            })
            .catch(() => {});
    }, []);

    const persist = (nextMode, nextScale) => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: nextMode, scale: nextScale }))
            .catch(() => {});
    };

    const setMode = (nextMode) => {
        setModeState(nextMode);
        persist(nextMode, scale);
    };

    const setScale = (nextScale) => {
        setScaleState(nextScale);
        persist(mode, nextScale);
    };

    const themeKey = `${mode}${scale === 'a60' ? '60' : ''}`;  // 'dark' | 'light' | 'dark60' | 'light60'
    const T = themes[themeKey] ?? themes.dark;

    return (
        <ThemeContext.Provider value={{ T, themeKey, mode, scale, setMode, setScale }}>
            {children}
        </ThemeContext.Provider>
    );
};

/** Hook principal — use em qualquer tela/componente */
export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
    return ctx;
};
