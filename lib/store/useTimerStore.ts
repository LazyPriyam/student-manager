import { create } from 'zustand';

export interface SessionLog {
    date: string; // ISO Date string
    duration: number; // minutes
}

interface TimerState {
    timeLeft: number;
    isActive: boolean;
    mode: 'focus' | 'break' | 'long-break';
    totalSessions: number;
    currentSessionIndex: number;
    sessionPlan: ('focus' | 'break' | 'long-break')[];
    history: SessionLog[];
    totalFocusMinutes: number;

    // Config
    focusDuration: number;
    breakDuration: number;
    longBreakDuration: number;

    setTimeLeft: (time: number) => void;
    setIsActive: (active: boolean) => void;
    setMode: (mode: 'focus' | 'break' | 'long-break') => void;
    setSessionPlan: (plan: ('focus' | 'break' | 'long-break')[]) => void;
    setDurations: (focus: number, shortBreak: number, longBreak: number) => void;
    advanceSession: () => void;
    logSession: (duration: number) => void;
    syncWithSupabase: () => Promise<void>;
}

import { supabase } from '@/lib/supabase/client';

export const useTimerStore = create<TimerState>((set, get) => ({
    timeLeft: 25 * 60,
    isActive: false,
    mode: 'focus',
    totalSessions: 0,
    currentSessionIndex: 0,
    sessionPlan: [],
    history: [],

    focusDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,

    totalFocusMinutes: 0,

    syncWithSupabase: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Profile for Timer State
        const { data: profile } = await supabase
            .from('profiles')
            .select('timer_start_time, timer_duration, timer_mode, timer_is_active, timer_focus_duration, timer_break_duration, timer_long_break_duration, timer_session_plan, timer_session_index')
            .eq('id', user.id)
            .single();

        if (profile) {
            const {
                timer_start_time,
                timer_duration,
                timer_mode,
                timer_is_active,
                timer_focus_duration,
                timer_break_duration,
                timer_long_break_duration,
                timer_session_plan,
                timer_session_index
            } = profile;

            // Set Config
            set({
                focusDuration: timer_focus_duration || 25,
                breakDuration: timer_break_duration || 5,
                longBreakDuration: timer_long_break_duration || 15,
                sessionPlan: timer_session_plan || [],
                currentSessionIndex: timer_session_index || 0
            });

            if (timer_is_active && timer_start_time) {
                const elapsedSeconds = Math.floor((Date.now() - new Date(timer_start_time).getTime()) / 1000);
                const remaining = (timer_duration || 0) - elapsedSeconds;

                set({
                    mode: timer_mode as any,
                    isActive: true,
                    timeLeft: remaining > 0 ? remaining : 0
                });
            } else {
                set({
                    mode: timer_mode as any || 'focus',
                    isActive: false,
                    timeLeft: timer_duration || 25 * 60
                });
            }
        }

        // Fetch Focus Sessions for History
        const { data: sessions } = await supabase
            .from('focus_sessions')
            .select('completed_at, duration')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: true });

        if (sessions) {
            const history = sessions.map(s => ({
                date: s.completed_at,
                duration: s.duration
            }));

            const totalMinutes = history.reduce((acc, curr) => acc + curr.duration, 0);

            set({
                history,
                totalFocusMinutes: totalMinutes
            });
        }
    },

    setTimeLeft: (time) => set({ timeLeft: time }),

    setIsActive: async (active) => {
        set({ isActive: active });
        const { timeLeft, mode } = get();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            await supabase.from('profiles').update({
                timer_is_active: active,
                timer_start_time: active ? new Date().toISOString() : null,
                timer_duration: timeLeft,
                timer_mode: mode
            }).eq('id', user.id);
        }
    },

    setMode: async (mode) => {
        set({ mode });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({ timer_mode: mode }).eq('id', user.id);
        }
    },

    setSessionPlan: async (plan) => {
        set({ sessionPlan: plan, currentSessionIndex: 0, totalSessions: plan.filter(p => p === 'focus').length });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({
                timer_session_plan: plan,
                timer_session_index: 0
            }).eq('id', user.id);
        }
    },

    setDurations: async (focus, shortBreak, longBreak) => {
        set({ focusDuration: focus, breakDuration: shortBreak, longBreakDuration: longBreak });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({
                timer_focus_duration: focus,
                timer_break_duration: shortBreak,
                timer_long_break_duration: longBreak
            }).eq('id', user.id);
        }
    },

    advanceSession: () => set((state) => {
        const nextIndex = state.currentSessionIndex + 1;
        if (nextIndex >= state.sessionPlan.length) {
            return { isActive: false, currentSessionIndex: 0, sessionPlan: [] }; // Plan finished
        }
        const nextMode = state.sessionPlan[nextIndex];
        let nextTime = state.focusDuration * 60;
        if (nextMode === 'break') nextTime = state.breakDuration * 60;
        if (nextMode === 'long-break') nextTime = state.longBreakDuration * 60;

        const newState = {
            currentSessionIndex: nextIndex,
            mode: nextMode,
            timeLeft: nextTime,
            isActive: false
        };

        // Sync new index and mode to DB
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                supabase.from('profiles').update({
                    timer_session_index: nextIndex,
                    timer_mode: nextMode,
                    timer_duration: nextTime,
                    timer_is_active: false
                }).eq('id', user.id).then();
            }
        });

        return newState;
    }),

    logSession: async (duration) => {
        set((state) => ({
            history: [...state.history, { date: new Date().toISOString(), duration }],
            totalFocusMinutes: state.totalFocusMinutes + duration
        }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('focus_sessions').insert({
                user_id: user.id,
                duration: duration,
                completed_at: new Date().toISOString()
            });
        }
    },
}));
