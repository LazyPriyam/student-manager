import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Habit {
    id: string;
    title: string;
    streak: number;
    completedDates: string[]; // ISO date strings (YYYY-MM-DD)
    xpReward: number;
    startDate?: string;
    endDate?: string;
    position?: number;
}

interface HabitState {
    habits: Habit[];
    addHabit: (title: string, xpReward: number, startDate?: string, endDate?: string) => void;
    toggleHabitCompletion: (id: string, date: string) => void;
    deleteHabit: (id: string) => void;
    updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
    reorderHabits: (activeId: string, overId: string) => Promise<void>;
    fetchHabits: () => Promise<void>;
    checkStreaks: () => void;
    resetData: () => Promise<void>;
}

import { supabase } from '@/lib/supabase/client';

export const useHabitStore = create<HabitState>((set, get) => ({
    habits: [], // Start empty, fetch on load

    fetchHabits: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: habits } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id);

        if (habits) {
            set({
                habits: habits.map(h => ({
                    id: h.id,
                    title: h.title,
                    streak: calculateStreak(h.completed_dates || []), // Recalculate on load to ensure accuracy
                    completedDates: h.completed_dates || [],
                    xpReward: h.xp_reward,
                    startDate: h.start_date,
                    endDate: h.end_date
                }))
            });
        }
    },

    addHabit: async (title, xpReward, startDate, endDate) => {
        const newHabit = {
            id: uuidv4(),
            title,
            streak: 0,
            completedDates: [],
            xpReward,
            startDate,
            endDate
        };

        set((state) => ({ habits: [...state.habits, newHabit] }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('habits').insert({
                id: newHabit.id,
                user_id: user.id,
                title,
                xp_reward: xpReward,
                start_date: startDate,
                end_date: endDate,
                completed_dates: []
            });
        }
    },

    toggleHabitCompletion: async (id, date) => {
        set((state) => ({
            habits: state.habits.map(h => {
                if (h.id !== id) return h;

                const isCompleted = h.completedDates.includes(date);
                let newCompletedDates = isCompleted
                    ? h.completedDates.filter(d => d !== date)
                    : [...h.completedDates, date];

                const newStreak = calculateStreak(newCompletedDates);

                // Sync to DB
                supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) {
                        supabase.from('habits').update({
                            completed_dates: newCompletedDates,
                            streak: newStreak
                        }).eq('id', id).then();
                    }
                });

                return {
                    ...h,
                    completedDates: newCompletedDates,
                    streak: newStreak
                };
            })
        }));
    },

    deleteHabit: async (id) => {
        set((state) => ({ habits: state.habits.filter(h => h.id !== id) }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('habits').delete().eq('id', id);
        }
    },

    updateHabit: async (id, updates) => {
        set((state) => ({
            habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h)
        }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const dbUpdates: any = {};
            if (updates.title) dbUpdates.title = updates.title;
            if (updates.xpReward) dbUpdates.xp_reward = updates.xpReward;
            if (updates.startDate) dbUpdates.start_date = updates.startDate;
            if (updates.endDate) dbUpdates.end_date = updates.endDate;

            if (Object.keys(dbUpdates).length > 0) {
                await supabase.from('habits').update(dbUpdates).eq('id', id);
            }
        }
    },

    reorderHabits: async (activeId, overId) => {
        set((state) => {
            const oldIndex = state.habits.findIndex((h) => h.id === activeId);
            const newIndex = state.habits.findIndex((h) => h.id === overId);

            if (oldIndex === -1 || newIndex === -1) return state;

            const newHabits = [...state.habits];
            const [movedHabit] = newHabits.splice(oldIndex, 1);
            newHabits.splice(newIndex, 0, movedHabit);

            return { habits: newHabits };
        });

        const { habits } = get();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const updates = habits.map((h, index) => ({
                id: h.id,
                user_id: user.id,
                title: h.title,
                position: index
            }));

            await supabase.from('habits').upsert(updates, { onConflict: 'id' });
        }
    },

    checkStreaks: () => set((state) => ({
        habits: state.habits.map(h => ({
            ...h,
            streak: calculateStreak(h.completedDates)
        }))
    })),

    resetData: async () => {
        set({ habits: [] });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('habits').delete().eq('user_id', user.id);
        }
    },
}));

// Helper to calculate streak based on consecutive days
function calculateStreak(dates: string[]): number {
    if (dates.length === 0) return 0;

    // Sort dates descending (newest first)
    const sortedDates = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If the most recent date isn't today or yesterday, streak is broken (0)
    // Exception: If we just unchecked today, we might still have a streak from yesterday, 
    // but this function just calculates based on what's present.
    // Actually, for a "current streak", if I haven't done it today yet, my streak is still valid from yesterday.
    // So we check if the most recent date is Today OR Yesterday.

    const lastDate = sortedDates[0];
    if (lastDate !== today && lastDate !== yesterday) {
        return 0;
    }

    let streak = 0;
    let currentDate = new Date(lastDate);

    for (const dateStr of sortedDates) {
        // Check if this date matches the expected current date in the sequence
        if (dateStr === currentDate.toISOString().split('T')[0]) {
            streak++;
            // Move expected date back one day
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            // Gap found, streak ends
            break;
        }
    }

    return streak;
}
