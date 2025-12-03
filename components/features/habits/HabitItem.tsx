import { useState } from 'react';
import { Habit, useHabitStore } from '@/lib/store/useHabitStore';
import { Check, Trash2, Flame, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/lib/store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '@/lib/sound';

interface HabitItemProps {
    habit: Habit;
}

export function HabitItem({ habit }: HabitItemProps) {
    const { toggleHabitCompletion, deleteHabit, updateHabit } = useHabitStore();
    const { addXp, addPoints, activeSound } = useUserStore();

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(habit.title);

    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completedDates.includes(today);

    const handleToggle = () => {
        toggleHabitCompletion(habit.id, today);
        if (!isCompletedToday) {
            // Completing
            addXp(habit.xpReward);
            addPoints(5);
        } else {
            // Un-completing (undo)
            addXp(-habit.xpReward);
            addPoints(-5);
        }
    };

    const handleSave = () => {
        if (editTitle.trim()) {
            updateHabit(habit.id, { title: editTitle });
            setIsEditing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setEditTitle(habit.title);
            setIsEditing(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all">
            <div className="flex items-center gap-4 flex-1">
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    animate={{ scale: isCompletedToday ? 1.1 : 1 }}
                    onClick={() => {
                        soundManager.playToggle(!isCompletedToday, activeSound);
                        handleToggle();
                    }}
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${isCompletedToday
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-green-500'
                        }`}
                >
                    <AnimatePresence>
                        {isCompletedToday && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <Check size={16} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>

                <div className="flex-1">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                            />
                            <button onClick={handleSave} className="text-green-600 hover:bg-green-50 p-1 rounded">
                                <Check size={16} />
                            </button>
                            <button onClick={() => { setIsEditing(false); setEditTitle(habit.title); }} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <h3 className={`font-medium text-lg ${isCompletedToday ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                                {habit.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1 text-xs text-orange-500 font-bold">
                                    <Flame size={12} />
                                    <span>{habit.streak} Day Streak</span>
                                </div>
                                <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                    +{habit.xpReward} XP
                                </span>
                                {habit.startDate && habit.endDate && (
                                    <span className="text-xs text-slate-400">
                                        {new Date(habit.startDate).toLocaleDateString()} - {new Date(habit.endDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1">
                {!isEditing && (
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-blue-500">
                        <Pencil size={18} />
                    </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => deleteHabit(habit.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={18} />
                </Button>
            </div>
        </div>
    );
}
