import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { useNotificationStore } from './useNotificationStore';

interface UserState {
    xp: number;
    level: number;
    points: number;

    // Active Customizations
    activeTheme: string;
    activeSound: string;
    activeEffect: string;
    activeTitle: string;

    addXp: (amount: number) => void;
    addPoints: (amount: number) => void;
    spendPoints: (amount: number) => void;

    // Equip actions
    setTheme: (themeId: string) => void;
    setSound: (soundId: string) => void;
    setEffect: (effectId: string) => void;
    setTitle: (titleId: string) => void;

    syncWithSupabase: () => Promise<void>;
    resetData: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    xp: 0,
    level: 1,
    points: 0,

    activeTheme: 'theme-dark',
    activeSound: 'sound-chime',
    activeEffect: 'fx-confetti',
    activeTitle: 'title-novice',

    syncWithSupabase: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            set({
                xp: profile.xp,
                level: profile.level,
                points: profile.points,
                activeTheme: profile.active_theme,
                activeSound: profile.active_sound,
                activeEffect: profile.active_effect,
                activeTitle: profile.active_title,
            });
        }
    },

    addXp: async (amount) => {
        // Trigger notification
        useNotificationStore.getState().addNotification({ type: 'xp', amount });

        set((state) => {
            const newXp = state.xp + amount;
            // Quadratic curve: Level = floor(sqrt(XP / 100)) + 1
            // 100 XP = Lvl 2, 400 XP = Lvl 3, 900 XP = Lvl 4
            const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

            let newPoints = state.points;
            if (newLevel > state.level) {
                const levelsGained = newLevel - state.level;
                newPoints += (100 * levelsGained); // 100 Points per level
            }

            // Sync to DB
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    supabase.from('profiles').update({
                        xp: newXp,
                        level: newLevel,
                        points: newPoints
                    }).eq('id', user.id).then();
                }
            });

            return { xp: newXp, level: newLevel, points: newPoints };
        });
    },

    addPoints: async (amount) => {
        // Trigger notification
        useNotificationStore.getState().addNotification({ type: 'points', amount });

        set((state) => {
            const newPoints = state.points + amount;

            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    supabase.from('profiles').update({ points: newPoints }).eq('id', user.id).then();
                }
            });

            return { points: newPoints };
        });
    },

    spendPoints: async (amount) => {
        set((state) => {
            const newPoints = Math.max(0, state.points - amount);

            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    supabase.from('profiles').update({ points: newPoints }).eq('id', user.id).then();
                }
            });

            return { points: newPoints };
        });
    },

    setTheme: (themeId) => {
        set({ activeTheme: themeId });
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) supabase.from('profiles').update({ active_theme: themeId }).eq('id', user.id).then();
        });
    },
    setSound: (soundId) => {
        set({ activeSound: soundId });
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) supabase.from('profiles').update({ active_sound: soundId }).eq('id', user.id).then();
        });
    },
    setEffect: (effectId) => {
        set({ activeEffect: effectId });
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) supabase.from('profiles').update({ active_effect: effectId }).eq('id', user.id).then();
        });
    },
    setTitle: (titleId) => {
        set({ activeTitle: titleId });
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) supabase.from('profiles').update({ active_title: titleId }).eq('id', user.id).then();
        });
    },
    resetData: async () => {
        set({
            xp: 0,
            level: 1,
            points: 0,
            activeTheme: 'theme-dark',
            activeSound: 'sound-chime',
            activeEffect: 'fx-confetti',
            activeTitle: 'title-novice',
        });

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({
                xp: 0,
                level: 1,
                points: 0,
                active_theme: 'theme-dark',
                active_sound: 'sound-chime',
                active_effect: 'fx-confetti',
                active_title: 'title-novice',
            }).eq('id', user.id);
        }
    },
}));
