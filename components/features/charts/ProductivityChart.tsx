'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { useTimerStore } from '@/lib/store/useTimerStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useHabitStore } from '@/lib/store/useHabitStore';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProductivityChart() {
    const { history: focusHistory } = useTimerStore();
    const { history: taskHistory } = useTaskStore();
    const { habits } = useHabitStore();

    const data = useMemo(() => {
        const days = 30;
        const result = [];
        const today = new Date();

        // Generate last 30 days
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Aggregate Focus Minutes
            // focusHistory date is ISO string, need to match YYYY-MM-DD
            const focusMinutes = focusHistory
                .filter(h => h.date.startsWith(dateStr))
                .reduce((acc, curr) => acc + curr.duration, 0);

            // Aggregate Tasks
            const tasksCompleted = taskHistory.find(h => h.date === dateStr)?.count || 0;

            // Aggregate Habits
            const habitsCompleted = habits.reduce((acc, habit) => {
                return acc + (habit.completedDates.includes(dateStr) ? 1 : 0);
            }, 0);

            // Calculate Score
            // Weights: Focus=1, Task=5, Habit=10
            const score = (focusMinutes * 1) + (tasksCompleted * 5) + (habitsCompleted * 10);

            result.push({
                date: dateStr,
                displayDate: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                focusMinutes,
                tasksCompleted,
                habitsCompleted,
                score
            });
        }
        return result;
    }, [focusHistory, taskHistory, habits]);

    const todayData = data[data.length - 1];
    const yesterdayData = data[data.length - 2];

    const growth = todayData.score - yesterdayData.score;
    const percentage = yesterdayData.score > 0
        ? Math.round((growth / yesterdayData.score) * 100)
        : (todayData.score > 0 ? 100 : 0);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Productivity Velocity
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Your growth over the last 30 days
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Today's Score</div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {todayData.score}
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${growth > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            growth < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                        {growth > 0 ? <TrendingUp size={16} /> :
                            growth < 0 ? <TrendingDown size={16} /> :
                                <Minus size={16} />}
                        {Math.abs(percentage)}%
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="displayDate"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                        />
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, fill: '#2563eb' }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
