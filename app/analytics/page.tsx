'use client';

import ProductivityHeatmap from '@/components/features/analytics/ProductivityHeatmap';
import FocusDistributionChart from '@/components/features/analytics/FocusDistributionChart';
import HabitConsistencyChart from '@/components/features/analytics/HabitConsistencyChart';

export default function AnalyticsPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Analytics & Insights</h1>
                    <p className="text-slate-500 dark:text-slate-400">Visualize your productivity trends and habits.</p>
                </header>

                <div className="space-y-8">
                    {/* Top Row: Heatmap (Full Width) */}
                    <ProductivityHeatmap />

                    {/* Bottom Row: Charts (Grid) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <FocusDistributionChart />
                        <HabitConsistencyChart />
                    </div>
                </div>
            </div>
        </div>
    );
}
