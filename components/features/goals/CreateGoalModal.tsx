'use client';

import { useState } from 'react';
// Dialog import removed as we are using custom modal 
// Actually, looking at previous files, we don't have a generic Dialog component yet. 
// I will build a simple modal here or use a library if available. 
// The user has 'framer-motion'. I'll build a custom modal overlay.

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trophy } from 'lucide-react';
import { useGoalStore, Difficulty } from '@/lib/store/useGoalStore';
import { useUserStore } from '@/lib/store/useUserStore';

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateGoalModal({ isOpen, onClose }: CreateGoalModalProps) {
    const { addGoal } = useGoalStore();
    const { points } = useUserStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [wager, setWager] = useState(0);
    const [milestones, setMilestones] = useState<string[]>(['']);

    const handleAddMilestone = () => {
        setMilestones([...milestones, '']);
    };

    const handleMilestoneChange = (index: number, value: string) => {
        const newMilestones = [...milestones];
        newMilestones[index] = value;
        setMilestones(newMilestones);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !endDate) return;

        await addGoal({
            title,
            description,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            difficulty,
            wagerAmount: wager
        }, milestones.filter(m => m.trim() !== ''));

        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setWager(0);
        setMilestones(['']);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">New Goal</h2>
                                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Goal Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                                                placeholder="e.g., Learn Python"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 resize-none h-20"
                                                placeholder="Why is this important?"
                                            />
                                        </div>
                                    </div>

                                    {/* Dates & Difficulty */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
                                            <select
                                                value={difficulty}
                                                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                                            >
                                                <option value="easy">Easy (1x XP)</option>
                                                <option value="medium">Medium (2x XP)</option>
                                                <option value="hard">Hard (3x XP)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Wager System */}
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-100">
                                                <Trophy size={16} />
                                                Wager Points
                                            </label>
                                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                                Available: {points}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={points}
                                            step="10"
                                            value={wager}
                                            onChange={(e) => setWager(parseInt(e.target.value))}
                                            className="w-full accent-amber-500"
                                        />
                                        <div className="flex justify-between text-xs mt-2">
                                            <span className="text-slate-500">Bet: {wager}</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">Win: {wager * 2}</span>
                                        </div>
                                    </div>

                                    {/* Milestones */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Milestones</label>
                                        <div className="space-y-2">
                                            {milestones.map((ms, idx) => (
                                                <input
                                                    key={idx}
                                                    type="text"
                                                    value={ms}
                                                    onChange={(e) => handleMilestoneChange(idx, e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                                                    placeholder={`Milestone ${idx + 1}`}
                                                />
                                            ))}
                                            <button
                                                type="button"
                                                onClick={handleAddMilestone}
                                                className="text-xs text-blue-500 font-bold flex items-center gap-1 hover:underline"
                                            >
                                                <Plus size={14} /> Add Milestone
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                                    >
                                        Create Goal
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
