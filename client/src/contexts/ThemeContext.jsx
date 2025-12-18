import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Check if user has a preference in localStorage or default to 'dark'
    const storedTheme = localStorage.getItem('theme') || 'dark';
    const [theme, setTheme] = useState(storedTheme);

    const themes = {
        dark: {
            name: 'Midnight Dark',
            bg: '#0F0F0F',
            accent: '#FF2E63',
            glassBg: 'rgba(255, 255, 255, 0.03)',
            text: '#FFFFFF'
        },
        light: {
            name: 'Cloud Light',
            bg: '#F5F7FA',
            accent: '#4FD1C5',
            glassBg: 'rgba(0, 0, 0, 0.03)',
            text: '#2D3748'
        },
        emerald: {
            name: 'Emerald Forest',
            bg: '#064E3B',
            accent: '#10B981',
            glassBg: 'rgba(255, 255, 255, 0.05)',
            text: '#ECFDF5'
        },
        royal: {
            name: 'Royal Purple',
            bg: '#1E1B4B',
            accent: '#818CF8',
            glassBg: 'rgba(255, 255, 255, 0.05)',
            text: '#EEF2FF'
        }
    };

    useEffect(() => {
        const root = document.documentElement;
        const currentTheme = themes[theme] || themes.dark;
        
        root.style.setProperty('--bg-color', currentTheme.bg);
        root.style.setProperty('--accent-color', currentTheme.accent);
        root.style.setProperty('--glass-bg', currentTheme.glassBg);
        root.style.setProperty('--text-primary', currentTheme.text);
        
        // Handle background breathing animation colors if needed
        localStorage.setItem('theme', theme);
        document.body.className = `theme-${theme}`;
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};
