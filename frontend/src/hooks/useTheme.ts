import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(() => {
        return (localStorage.getItem('theme') as Theme) || 'system';
    });

    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

    useEffect(() => {
        const handleThemeChange = (e: Event) => {
            const customEvent = e as CustomEvent<Theme>;
            if (customEvent.detail !== theme) {
                setThemeState(customEvent.detail);
            }
        };
        window.addEventListener('theme-change', handleThemeChange);
        return () => window.removeEventListener('theme-change', handleThemeChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        window.dispatchEvent(new CustomEvent('theme-change', { detail: newTheme }));
    };

    useEffect(() => {
        const root = window.document.documentElement;
        let isDark = false;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        if (theme === 'system') {
            isDark = mediaQuery.matches;
        } else {
            isDark = theme === 'dark';
        }

        const newResolved: ResolvedTheme = isDark ? 'dark' : 'light';
        setResolvedTheme(newResolved);

        root.classList.remove('light', 'dark');
        root.classList.add(newResolved);

        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            if (theme === 'system') {
                const systemIsDark = e.matches;
                setResolvedTheme(systemIsDark ? 'dark' : 'light');
                root.classList.remove('light', 'dark');
                root.classList.add(systemIsDark ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);

    }, [theme]);

    return { theme, resolvedTheme, setTheme };
}
