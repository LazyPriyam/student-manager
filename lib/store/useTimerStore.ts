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
}

export const useTimerStore = create<TimerState>((set) => ({
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

    setTimeLeft: (time) => set({ timeLeft: time }),
    setIsActive: (active) => set({ isActive: active }),
    setMode: (mode) => set({ mode }),
    setSessionPlan: (plan) => set({ sessionPlan: plan, currentSessionIndex: 0, totalSessions: plan.filter(p => p === 'focus').length }),
    setDurations: (focus, shortBreak, longBreak) => set({ focusDuration: focus, breakDuration: shortBreak, longBreakDuration: longBreak }),
    advanceSession: () => set((state) => {
        const nextIndex = state.currentSessionIndex + 1;
        if (nextIndex >= state.sessionPlan.length) {
            return { isActive: false, currentSessionIndex: 0, sessionPlan: [] }; // Plan finished
        }
        const nextMode = state.sessionPlan[nextIndex];
        let nextTime = state.focusDuration * 60;
        if (nextMode === 'break') nextTime = state.breakDuration * 60;
        if (nextMode === 'long-break') nextTime = state.longBreakDuration * 60;

        return {
            currentSessionIndex: nextIndex,
            mode: nextMode,
            timeLeft: nextTime,
            isActive: false
        };
    }),
    logSession: (duration) => set((state) => ({
        history: [...state.history, { date: new Date().toISOString(), duration }],
        totalFocusMinutes: state.totalFocusMinutes + duration
    })),
}));
