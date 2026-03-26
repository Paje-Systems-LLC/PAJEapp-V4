/**
 * PAJE Systems — Design Tokens
 * Sistema de 4 variantes: dark/light × normal/60+
 *
 * Como usar:
 *   import { useTheme } from '../theme/ThemeContext';
 *   const { T } = useTheme();
 *   style={{ color: T.text.primary, fontSize: T.font.base }}
 */

// ─── Paleta de marca (imutável) ────────────────────────────────────────────────
export const brand = {
    navyDeep:   '#0F2646',  // azul navy profundo (barra 1)
    blue:       '#5289C3',  // azul médio (barra 2)
    gold:       '#D4AF37',  // ouro mate
    goldDark:   '#B8860B',  // ouro escurecido (uso em fundo claro)
    green:      '#92C456',  // verde sucesso
    red:        '#BC0000',  // vermelho perigo
    blueAction: '#3B82F6',  // azul de ação (legível em fundo escuro)
    blueDeep:   '#1E3A8A',  // azul ação (legível em fundo claro)
};

// ─── Escala tipográfica ─────────────────────────────────────────────────────────
const fontScale = {
    normal: {
        xs:   11,
        sm:   13,
        base: 15,
        md:   17,
        lg:   20,
        xl:   24,
        xxl:  32,
        xxxl: 40,
        lineHeightMultiplier: 1.45,
    },
    a60: {   // "a60" = acessibilidade 60+
        xs:   14,
        sm:   16,
        base: 18,
        md:   20,
        lg:   24,
        xl:   28,
        xxl:  36,
        xxxl: 48,
        lineHeightMultiplier: 1.6,
    },
};

// ─── Escala de espaçamento ──────────────────────────────────────────────────────
const spacingScale = {
    normal: { xs: 4,  sm: 8,  md: 16, lg: 24, xl: 32, xxl: 48 },
    a60:    { xs: 6,  sm: 12, md: 20, lg: 32, xl: 48, xxl: 64 },
};

// ─── Tamanhos de toque (botões, ícones clicáveis) ───────────────────────────────
const touchScale = {
    normal: { min: 44, icon: 44, btn: 48 },
    a60:    { min: 56, icon: 56, btn: 64 },
};

// ─── Raios de borda ─────────────────────────────────────────────────────────────
const radii = {
    normal: { sm: 6,  md: 10, lg: 14, full: 999 },
    a60:    { sm: 8,  md: 12, lg: 16, full: 999 },
};

// ─── Paletas por modo (dark / light) ───────────────────────────────────────────
//
// Critério de contraste WCAG AA:
//   texto normal  ≥ 4.5:1
//   texto grande  ≥ 3.0:1
//   modo 60+      ≥ 7.0:1 (AAA)
//
const palette = {
    dark: {
        bg:             '#0A1325',  // fundo principal
        bgSubtle:       '#080F1C',  // fundo ainda mais escuro (status bar area)
        surface:        '#162136',  // cards
        surfaceRaised:  '#1E2D45',  // modais, popovers
        border:         '#1E293B',  // bordas
        borderFocus:    '#3B82F6',  // borda em foco

        text: {
            primary:    '#E2E8F0',  // contraste 14.8:1 ✓✓✓
            secondary:  '#94A3B8',  //             6.5:1 ✓✓
            disabled:   '#475569',  //             1.9:1 (apenas decorativo)
            inverse:    '#0F172A',  // texto sobre fundo claro
            link:       '#60A5FA',  //             5.9:1 ✓✓
            gold:       '#D4AF37',  //             6.2:1 ✓✓
            success:    '#4ADE80',
            error:      '#F87171',
            warning:    '#FBBF24',
        },

        action: {
            primary:    '#3B82F6',  // botão principal
            primaryText:'#FFFFFF',
            secondary:  '#1E293B',  // botão secundário
            secondaryText: '#E2E8F0',
            danger:     '#EF4444',
            dangerText: '#FFFFFF',
            gold:       '#D4AF37',
            goldText:   '#0A1325',
        },

        overlay:        'rgba(0,0,0,0.6)',
        shadow:         '#000000',
    },

    light: {
        bg:             '#F1F5F9',
        bgSubtle:       '#E2E8F0',
        surface:        '#FFFFFF',
        surfaceRaised:  '#FFFFFF',
        border:         '#CBD5E1',
        borderFocus:    '#1E3A8A',

        text: {
            primary:    '#0F172A',  // contraste 17.5:1 ✓✓✓
            secondary:  '#475569',  //             8.9:1 ✓✓✓
            disabled:   '#94A3B8',  //             2.8:1 (apenas decorativo)
            inverse:    '#F1F5F9',
            link:       '#1D4ED8',  //             7.2:1 ✓✓✓
            gold:       '#B8860B',  //             4.6:1 ✓
            success:    '#15803D',
            error:      '#B91C1C',
            warning:    '#B45309',
        },

        action: {
            primary:    '#1E3A8A',
            primaryText:'#FFFFFF',
            secondary:  '#E2E8F0',
            secondaryText: '#0F172A',
            danger:     '#B91C1C',
            dangerText: '#FFFFFF',
            gold:       '#B8860B',
            goldText:   '#FFFFFF',
        },

        overlay:        'rgba(15,23,42,0.5)',
        shadow:         '#0F172A',
    },
};

// ─── Composição final dos 4 temas ──────────────────────────────────────────────

const buildTheme = (mode, scale) => ({
    ...palette[mode],
    font:    fontScale[scale],
    spacing: spacingScale[scale],
    touch:   touchScale[scale],
    radius:  radii[scale],
    mode,       // 'dark' | 'light'
    scale,      // 'normal' | 'a60'
    is60: scale === 'a60',
    isDark: mode === 'dark',
});

export const themes = {
    dark:      buildTheme('dark',  'normal'),
    light:     buildTheme('light', 'normal'),
    dark60:    buildTheme('dark',  'a60'),
    light60:   buildTheme('light', 'a60'),
};

// Chaves válidas: 'dark' | 'light' | 'dark60' | 'light60'
