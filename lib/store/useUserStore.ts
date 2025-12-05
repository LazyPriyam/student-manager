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
    isInitialized: boolean;
    quoteIndex: number;
    lastLoginDate?: string;

    addXp: (amount: number) => void;
    addPoints: (amount: number) => void;
    spendPoints: (amount: number) => void;
    rerollQuote: () => void;
    checkDailyBonus: () => Promise<boolean>;

    // Equip actions
    setTheme: (themeId: string) => void;
    setSound: (soundId: string) => void;
    setEffect: (effectId: string) => void;
    setTitle: (titleId: string) => void;

    syncWithSupabase: () => Promise<void>;
    resetData: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    xp: 0,
    level: 1,
    points: 0,

    activeTheme: 'theme-dark',
    activeSound: 'sound-chime',
    activeEffect: 'fx-confetti',
    activeTitle: 'title-novice',
    isInitialized: false,
    quoteIndex: 0,
    lastLoginDate: undefined,

    rerollQuote: () => set(state => ({ quoteIndex: state.quoteIndex + 1 })),

    syncWithSupabase: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set({ isInitialized: true });
            return;
        }

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
                lastLoginDate: profile.last_login_date,
                isInitialized: true
            });
        } else {
            set({ isInitialized: true });
        }
    },

    addXp: async (amount) => {
        // Check for active power-ups
        // We use require to avoid circular dependency issues at module level if any
        const { activeItems } = require('./useShopStore').useShopStore.getState();
        const now = Date.now();

        let multiplier = 1;

        // XP Potion (1.1x)
        if (activeItems.some((i: any) => i.itemId === 'power-xp1' && new Date(i.expiresAt).getTime() > now)) {
            multiplier *= 1.1;
        }
        // Double XP (2x)
        if (activeItems.some((i: any) => i.itemId === 'power-xp2' && new Date(i.expiresAt).getTime() > now)) {
            multiplier *= 2;
        }
        // Triple XP (3x)
        if (activeItems.some((i: any) => i.itemId === 'power-xp3' && new Date(i.expiresAt).getTime() > now)) {
            multiplier *= 3;
        }

        const finalAmount = Math.round(amount * multiplier);

        // Trigger notification
        useNotificationStore.getState().addNotification({ type: 'xp', amount: finalAmount });

        set((state) => {
            const newXp = state.xp + finalAmount;
            // Quadratic curve: Level = floor(sqrt(XP / 100)) + 1
            // 100 XP = Lvl 2, 400 XP = Lvl 3, 900 XP = Lvl 4
            const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

            let newPoints = state.points;
            if (newLevel > state.level) {
                const levelsGained = newLevel - state.level;
                newPoints += (100 * levelsGained); // 100 Points per level
            } else if (newLevel < state.level) {
                const levelsLost = state.level - newLevel;
                newPoints = Math.max(0, newPoints - (100 * levelsLost)); // Deduct points, but don't go below 0
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
        // Check for active power-ups
        const { activeItems } = require('./useShopStore').useShopStore.getState();
        const now = Date.now();

        let multiplier = 1;

        // Point Booster (1.5x)
        if (activeItems.some((i: any) => i.itemId === 'power-point' && new Date(i.expiresAt).getTime() > now)) {
            multiplier *= 1.5;
        }

        const finalAmount = Math.round(amount * multiplier);

        // Trigger notification
        useNotificationStore.getState().addNotification({ type: 'points', amount: finalAmount });

        set((state) => {
            const newPoints = state.points + finalAmount;

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
    checkDailyBonus: async () => {
        // We need to access the state to get lastLoginDate
        // Since 'get' is not available in the object literal scope directly if not passed to create
        // Wait, create((set, get) => ({ ... })) - get IS available!
        // I must have missed adding 'get' to the create function signature in previous edits.

        // Let's assume I fix the signature in this replace as well.
        // But I can't change the signature line 33 easily with this block.
        // I'll assume 'get' is available or I'll use useUserStore.getState() if I can't change signature.
        // Actually, I can use useUserStore.getState() inside the function!
        // But wait, useUserStore is const defined by create... so it's circular if I use it inside.
        // The correct way is to ensure 'get' is passed.

        // I will replace the whole file content or a large chunk to fix the signature.
        // But wait, the previous tool call showed line 33: export const useUserStore = create<UserState>((set, get) => ({
        // It missed 'get'.

        // I will fix the signature line first.
        const { lastLoginDate } = get();
        const today = new Date().toISOString().split('T')[0];

        if (lastLoginDate !== today) {
            // New day! Award bonus
            const bonusPoints = 50;
            const bonusXp = 10;

            get().addPoints(bonusPoints);
            get().addXp(bonusXp);

            set({ lastLoginDate: today });

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({ last_login_date: today }).eq('id', user.id);
            }

            return true; // Trigger modal
        }

        return false;
    },
}));
