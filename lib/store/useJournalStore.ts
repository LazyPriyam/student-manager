import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase/client';
import { useUserStore } from './useUserStore';

export type Mood = 'happy' | 'neutral' | 'sad' | 'stressed' | 'focused';

export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    mood: Mood;
    createdAt: string;
}

interface JournalState {
    entries: JournalEntry[];
    addEntry: (title: string, content: string, mood: Mood) => Promise<void>;
    updateEntry: (id: string, title: string, content: string, mood: Mood) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    fetchEntries: () => Promise<void>;
    resetData: () => Promise<void>;
}

export const useJournalStore = create<JournalState>((set, get) => ({
    entries: [],

    fetchEntries: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: entries } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (entries) {
            set({
                entries: entries.map(e => ({
                    id: e.id,
                    title: e.title,
                    content: e.content,
                    mood: e.mood as Mood,
                    createdAt: e.created_at
                }))
            });
        }
    },

    addEntry: async (title, content, mood) => {
        const newEntry = {
            id: uuidv4(),
            title,
            content,
            mood,
            createdAt: new Date().toISOString()
        };

        // Gamification: Check if first entry of the day
        const today = new Date().toISOString().split('T')[0];
        const hasEntryForToday = get().entries.some(e => e.createdAt.startsWith(today));

        if (!hasEntryForToday) {
            useUserStore.getState().addXp(50);
        }

        set((state) => ({ entries: [newEntry, ...state.entries] }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('journal_entries').insert({
                id: newEntry.id,
                user_id: user.id,
                title,
                content,
                mood,
                created_at: newEntry.createdAt
            });
        }
    },

    deleteEntry: async (id) => {
        set((state) => ({ entries: state.entries.filter(e => e.id !== id) }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('journal_entries').delete().eq('id', id);
        }
    },

    resetData: async () => {
        set({ entries: [] });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('journal_entries').delete().eq('user_id', user.id);
        }
    },

    updateEntry: async (id, title, content, mood) => {
        set((state) => ({
            entries: state.entries.map(e =>
                e.id === id ? { ...e, title, content, mood } : e
            )
        }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('journal_entries').update({
                title,
                content,
                mood
            }).eq('id', id);
        }
    },
}));
