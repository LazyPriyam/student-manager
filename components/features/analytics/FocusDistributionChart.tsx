'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTimerStore } from '@/lib/store/useTimerStore';

export default function FocusDistributionChart() {
    const { history } = useTimerStore();

    const hourlyData = useMemo(() => {
        const hours = Array(24).fill(0);

        history.forEach(session => {
            const date = new Date(session.date);
            const hour = date.getHours();
            hours[hour] += session.duration;
        });

        return hours.map((minutes, hour) => ({
            hour: `${hour}:00`,
            minutes,
            label: hour // for sorting/key
        }));
    }, [history]);

    // Find max for scaling if needed, but recharts handles auto-scale well.

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Peak Focus Hours</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="hour"
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                            interval={3} // Show every 3rd hour to avoid clutter
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                            label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                            {hourlyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.minutes > 60 ? '#3b82f6' : '#93c5fd'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
