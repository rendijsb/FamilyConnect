// src/constants/theme.ts
import React, { createContext, useContext } from 'react';

export const colors = {
    primary: '#8B0000',      // Dark Red
    primaryLight: '#A52A2A',  // Brown Red
    accent: '#DC143C',       // Crimson
    secondary: '#FFFFFF',    // White
    background: '#FAFAFA',   // Off-white
    surface: '#FFFFFF',      // White
    text: '#333333',         // Dark Gray
    textLight: '#666666',    // Medium Gray
    textSecondary: '#999999', // Light Gray
    success: '#28A745',      // Green
    warning: '#FFC107',      // Orange
    error: '#DC3545',        // Red
    border: '#E5E5E5',       // Light Border
    shadow: '#00000020',     // Shadow
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const typography = {
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
    },
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        bold: '600' as const,
    },
    lineHeights: {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 28,
        xl: 32,
        xxl: 40,
    },
} as const;

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    round: 50,
} as const;

export const shadows = {
    sm: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
} as const;

// Theme context for additional theme logic if needed
export const ThemeContext = createContext({});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ThemeContext.Provider value={{}}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

// Style utilities
export const createStyleSheet = <T extends Record<string, any>>(styles: T): T => styles;