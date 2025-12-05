'use client';

import { useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useTimerStore } from '@/lib/store/useTimerStore';
import { useHabitStore } from '@/lib/store/useHabitStore';
import { Tooltip } from 'react-tooltip';

export default function ProductivityHeatmap() {
    const { history: focusHistory } = useTimerStore();
    const { habits } = useHabitStore();

    const heatmapData = useMemo(() => {
        const dataMap = new Map<string, number>();

        // 1. Add Focus Minutes (1 point per 15 mins)
        focusHistory.forEach(session => {
            const date = session.date.split('T')[0];
            const points = Math.ceil(session.duration / 15);
            dataMap.set(date, (dataMap.get(date) || 0) + points);
        });

        // 2. Add Habit Completions (2 points per habit)
        habits.forEach(habit => {
            habit.completedDates.forEach(date => {
                dataMap.set(date, (dataMap.get(date) || 0) + 2);
            });
        });

        return Array.from(dataMap.entries()).map(([date, count]) => ({
            date,
            count: Math.min(count, 10) // Cap at 10 for intensity scaling
        }));
    }, [focusHistory, habits]);

    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Productivity Heatmap</h3>
            <div className="w-full overflow-x-auto">
                <div className="min-w-[600px]">
                    <CalendarHeatmap
                        startDate={startDate}
                        endDate={today}
                        values={heatmapData}
                        classForValue={(value: any) => {
                            if (!value) {
                                return 'color-empty';
                            }
                            // Scale 1-4 based on count
                            let scale = 1;
                            if (value.count >= 8) scale = 4;
                            else if (value.count >= 5) scale = 3;
                            else if (value.count >= 2) scale = 2;
                            return `color-scale-${scale}`;
                        }}
                        tooltipDataAttrs={(value: any) => {
                            if (!value || !value.date) return {} as any;
                            return {
                                'data-tooltip-id': 'heatmap-tooltip',
                                'data-tooltip-content': `${value.date}: ${value.count} points`,
                            };
                        }}
                        showWeekdayLabels={true}
                    />
                    <Tooltip id="heatmap-tooltip" />
                </div>
            </div>
            <style jsx global>{`
                .react-calendar-heatmap text {
                    font-size: 10px;
                    fill: #94a3b8;
                }
                .react-calendar-heatmap .color-empty {
                    fill: #f1f5f9; /* slate-100 */
                }
                .dark .react-calendar-heatmap .color-empty {
                    fill: #1e293b; /* slate-800 */
                }
                .react-calendar-heatmap .color-scale-1 { fill: #bfdbfe; } /* blue-200 */
                .react-calendar-heatmap .color-scale-2 { fill: #60a5fa; } /* blue-400 */
                .react-calendar-heatmap .color-scale-3 { fill: #2563eb; } /* blue-600 */
                .react-calendar-heatmap .color-scale-4 { fill: #1e40af; } /* blue-800 */
                
                .dark .react-calendar-heatmap .color-scale-1 { fill: #1e3a8a; } /* blue-900 */
                .dark .react-calendar-heatmap .color-scale-2 { fill: #1d4ed8; } /* blue-700 */
                .dark .react-calendar-heatmap .color-scale-3 { fill: #3b82f6; } /* blue-500 */
                .dark .react-calendar-heatmap .color-scale-4 { fill: #93c5fd; } /* blue-300 */
            `}</style>
        </div>
    );
}
