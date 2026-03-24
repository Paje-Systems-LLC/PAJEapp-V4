
export const colors = {
  // Brand Colors extracted from palette
  primary: '#0F2646',    // Dark Navy Blue (First bar)
  primaryLight: '#5289C3', // Lighter Blue (Second bar)
  secondary: '#E6A500',  // Gold/Yellow (Third bar)
  accent: '#92C456',     // Light Green (Fourth bar)
  danger: '#BC0000',     // Red (Sixth bar)

  // Neutrals
  black: '#000000',
  white: '#FFFFFF',

  // Semantic Aliases
  background: '#F5F5F7',
  surface: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  error: '#BC0000',      // Mapped to palette Red
  success: '#92C456',    // Mapped to palette Green
  border: '#D1D1D6',     // Light Grey
  accentGold: '#D4AF37', // Matte Gold (Amarelo alaranjado sem brilho)
  textPrimary: '#1C1C1E', // Alias for text, used across screens
  textLight: '#FFFFFF',   // Light text for dark backgrounds
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 16,
    color: colors.text,
  },
  caption: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
};

export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5.46,
    elevation: 5,
  },
};
