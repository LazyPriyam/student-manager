'use client';

import { useState } from 'react';
import { useHabitStore } from '@/lib/store/useHabitStore';
import { HabitItem } from './HabitItem';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function HabitList() {
    const { habits, addHabit } = useHabitStore();
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [xpReward, setXpReward] = useState(10);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleAddHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitTitle.trim()) return;
        addHabit(newHabitTitle, xpReward, startDate || undefined, endDate || undefined);
        setNewHabitTitle('');
        setXpReward(10);
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <form onSubmit={handleAddHabit} className="flex flex-col gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newHabitTitle}
                        onChange={(e) => setNewHabitTitle(e.target.value)}
                        placeholder="New Habit (e.g., Read 10 pages)..."
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-colors"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-500 uppercase">XP Reward</label>
                        <input
                            type="number"
                            value={xpReward}
                            onChange={(e) => setXpReward(Number(e.target.value))}
                            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 w-24"
                            min={1}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-500 uppercase">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:[color-scheme:dark]"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-500 uppercase">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:[color-scheme:dark]"
                        />
                    </div>
                </div>
            </form>

            <div className="space-y-3">
                <AnimatePresence mode='popLayout'>
                    {habits.map((habit) => (
                        <motion.div
                            key={habit.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                        >
                            <HabitItem habit={habit} />
                        </motion.div>
                    ))}
                </AnimatePresence>
                {habits.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-slate-400 dark:text-slate-600 italic"
                    >
                        No habits yet. Start building your streak!
                    </motion.div>
                )}
            </div>
        </div>
    );
}
