'use client';

import { Goal, useGoalStore } from '@/lib/store/useGoalStore';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Circle, Trophy, AlertTriangle, Clock } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

interface GoalCardProps {
    goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
    const { toggleMilestone, deleteGoal } = useGoalStore();

    const totalDays = differenceInDays(new Date(goal.endDate), new Date(goal.startDate));
    const daysLeft = differenceInDays(new Date(goal.endDate), new Date());
    const progressDays = totalDays - daysLeft;
    const timeProgress = Math.min(100, Math.max(0, (progressDays / totalDays) * 100));

    const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
    const totalMilestones = goal.milestones.length;
    const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    // Urgency Color
    let urgencyColor = 'bg-green-500';
    if (timeProgress > 80) urgencyColor = 'bg-red-500';
    else if (timeProgress > 50) urgencyColor = 'bg-yellow-500';

    // Status Color
    const statusColor = goal.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
        : goal.status === 'failed' ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl border shadow-sm p-6 relative overflow-hidden ${statusColor}`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {goal.title}
                        {goal.difficulty === 'hard' && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Hard</span>}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{goal.description}</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
                        <Trophy size={14} />
                        <span>{goal.wagerAmount} pts</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        Due {format(new Date(goal.endDate), 'MMM d')}
                    </div>
                </div>
            </div>

            {/* Burn-down Chart */}
            <div className="mb-6 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Progress</span>
                    <span>Time Elapsed</span>
                </div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                    {/* Time Bar */}
                    <div
                        className={`absolute top-0 left-0 h-full ${urgencyColor} opacity-30 transition-all duration-500`}
                        style={{ width: `${timeProgress}%` }}
                    />
                    {/* Progress Bar */}
                    <div
                        className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${milestoneProgress}%` }}
                    />
                </div>
                {timeProgress > milestoneProgress && goal.status === 'active' && (
                    <div className="flex items-center gap-1 text-xs text-red-500 font-bold">
                        <AlertTriangle size={12} />
                        Falling Behind!
                    </div>
                )}
            </div>

            {/* Milestones */}
            <div className="space-y-2">
                {goal.milestones.map(milestone => (
                    <button
                        key={milestone.id}
                        onClick={() => toggleMilestone(goal.id, milestone.id)}
                        disabled={goal.status !== 'active'}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                    >
                        <div className={`text-slate-400 transition-colors ${milestone.isCompleted ? 'text-green-500' : 'group-hover:text-blue-500'}`}>
                            {milestone.isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                        </div>
                        <span className={`text-sm ${milestone.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                            {milestone.title}
                        </span>
                    </button>
                ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                    Delete Goal
                </button>
            </div>
        </motion.div>
    );
}
