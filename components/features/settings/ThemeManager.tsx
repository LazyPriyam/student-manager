'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/store/useUserStore';

export function ThemeManager() {
    const { activeTheme } = useUserStore();

    useEffect(() => {
        // Remove 'theme-' prefix to get the clean name if needed, 
        // but keeping it unique is fine.
        document.documentElement.setAttribute('data-theme', activeTheme);

        // Handle special cases if needed (e.g. forcing dark mode)
        if (activeTheme === 'theme-light' || activeTheme === 'theme-sepia') {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    }, [activeTheme]);

    return null;
}
