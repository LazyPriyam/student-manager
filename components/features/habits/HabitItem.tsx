'use client';

import { Habit, useHabitStore } from '@/lib/store/useHabitStore';
import { Check, Trash2, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/lib/store/useUserStore';

interface HabitItemProps {
    habit: Habit;
}

export function HabitItem({ habit }: HabitItemProps) {
    const { toggleHabitCompletion, deleteHabit } = useHabitStore();
    const { addXp, addPoints } = useUserStore();

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

    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all">
            <div className="flex items-center gap-4">
                <button
                    onClick={handleToggle}
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${isCompletedToday
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-green-500'
                        }`}
                >
                    {isCompletedToday && <Check size={16} />}
                </button>
                <div>
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
                </div>
            </div>

            <Button variant="ghost" size="icon" onClick={() => deleteHabit(habit.id)} className="text-slate-400 hover:text-red-500">
                <Trash2 size={18} />
            </Button>
        </div>
    );
}
