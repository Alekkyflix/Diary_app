import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Check if user has a preference in localStorage or default to 'dark'
    const storedTheme = localStorage.getItem('theme') || 'dark';
    const [theme, setTheme] = useState(storedTheme);
    const [season, setSeason] = useState(localStorage.getItem('season') || 'winter'); // winter, summer, spring, autumn

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
            bg: '#022C22',
            accent: '#10B981',
            glassBg: 'rgba(16, 185, 129, 0.08)',
            text: '#D1FAE5'
        },
        royal: {
            name: 'Royal Purple',
            bg: '#1E1B4B',
            accent: '#818CF8',
            glassBg: 'rgba(255, 255, 255, 0.05)',
            text: '#EEF2FF'
        },
        aurora: {
            name: 'Aurora Neon',
            bg: '#0B0118',
            accent: '#A855F7',
            glassBg: 'rgba(168, 85, 247, 0.05)',
            text: '#F5F3FF'
        },
        sunset: {
            name: 'Desert Sunset',
            bg: '#2D1B0D',
            accent: '#F97316',
            glassBg: 'rgba(249, 115, 22, 0.05)',
            text: '#FFF7ED'
        },
        hacker: {
            name: 'Terminal 01',
            bg: '#050505',
            accent: '#22C55E',
            glassBg: 'rgba(34, 197, 94, 0.05)',
            text: '#DCFCE7'
        }
    };

    useEffect(() => {
        const root = document.documentElement;
        const currentTheme = themes[theme] || themes.dark;
        
        root.style.setProperty('--bg-color', currentTheme.bg);
        root.style.setProperty('--accent-color', currentTheme.accent);
        root.style.setProperty('--glass-bg', currentTheme.glassBg);
        root.style.setProperty('--text-primary', currentTheme.text);
        
        const rgb = hexToRgb(currentTheme.accent);
        if (rgb) {
            root.style.setProperty('--accent-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
        
        // Handle background breathing animation colors if needed
        localStorage.setItem('theme', theme);
        localStorage.setItem('season', season);
        document.body.className = `theme-${theme} season-${season}`;
    }, [theme, season]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes, season, setSeason }}>
            {children}
        </ThemeContext.Provider>
    );
};
