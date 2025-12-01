'use client';

import { useTimerStore } from '@/lib/store/useTimerStore';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Coffee, Play, Pause } from 'lucide-react';

export function FloatingTimer() {
    const { timeLeft, isActive, mode, setIsActive } = useTimerStore();
    const pathname = usePathname();
    const router = useRouter();

    // Don't show on the main dashboard where the full timer is visible
    if (pathname === '/') return null;

    // Don't show if timer is not active and reset (optional, but user asked for status)
    // Let's show it if it's active OR if it has been started (timeLeft != default?)
    // Actually, user said "showing the timer status", implies always visible if running or paused.
    // If it's completely reset (25:00 and not active), maybe hide it?
    // For now, let's show it if isActive is true OR timeLeft < duration (meaning it's in progress).
    // But to be safe and simple, let's just show it always when not on dashboard, 
    // or maybe only when isActive? "timer status" implies running.
    // Let's show it if isActive is true.

    if (!isActive && timeLeft === 25 * 60 && mode === 'focus') return null; // Hide if completely reset

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleTimer = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsActive(!isActive);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                onClick={() => router.push('/')}
                className="fixed bottom-20 right-6 z-40 flex items-center gap-3 p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full shadow-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:scale-105 transition-transform group"
            >
                <div className={`p-2 rounded-full ${mode === 'focus' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {mode === 'focus' ? <Brain size={20} /> : <Coffee size={20} />}
                </div>

                <div className="flex flex-col mr-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {mode === 'focus' ? 'Focus' : 'Break'}
                    </span>
                    <span className="text-lg font-mono font-bold leading-none">
                        {formatTime(timeLeft)}
                    </span>
                </div>

                <button
                    onClick={toggleTimer}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    {isActive ? <Pause size={16} /> : <Play size={16} />}
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
