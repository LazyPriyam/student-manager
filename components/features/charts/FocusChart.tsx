'use client';

import { useTimerStore } from '@/lib/store/useTimerStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function FocusChart() {
    const { history } = useTimerStore();

    // Process history to group by date
    const data = history.reduce((acc, session) => {
        const date = new Date(session.date).toLocaleDateString('en-US', { weekday: 'short' });
        const existing = acc.find(d => d.date === date);
        if (existing) {
            existing.minutes += session.duration;
        } else {
            acc.push({ date, minutes: session.duration });
        }
        return acc;
    }, [] as { date: string; minutes: number }[]);

    // Fill in missing days if needed (optional, keeping it simple for now)
    // If data is empty, show some placeholders
    const chartData = data.length > 0 ? data : [
        { date: 'Mon', minutes: 0 },
        { date: 'Tue', minutes: 0 },
        { date: 'Wed', minutes: 0 },
        { date: 'Thu', minutes: 0 },
        { date: 'Fri', minutes: 0 },
        { date: 'Sat', minutes: 0 },
        { date: 'Sun', minutes: 0 },
    ];

    return (
        <div className="w-full h-64 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Daily Focus (Minutes)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                    <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.minutes > 60 ? '#3b82f6' : '#93c5fd'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
