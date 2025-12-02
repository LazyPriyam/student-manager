'use client';

import { useUserStore } from '@/lib/store/useUserStore';
import { useHabitStore } from '@/lib/store/useHabitStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useShopStore } from '@/lib/store/useShopStore';
import { useJournalStore } from '@/lib/store/useJournalStore';
import { useTimerStore } from '@/lib/store/useTimerStore';
import { useGoalStore } from '@/lib/store/useGoalStore';
import { Trophy, Star, Zap, Clock } from 'lucide-react';
import { FocusChart } from '@/components/features/charts/FocusChart';
import { ProductivityChart } from '@/components/features/charts/ProductivityChart';
import { InventoryGrid } from '@/components/features/profile/InventoryGrid';
import { CouponList } from '@/components/features/profile/CouponList';
import { PowerupList } from '@/components/features/profile/PowerupList';

export default function ProfilePage() {
    const { level, xp, points, activeTitle } = useUserStore();
    const { totalFocusMinutes } = useTimerStore();

    const totalHours = Math.floor(totalFocusMinutes / 60);
    // Mock data for "All Time High" - in a real app this would come from analytics store
    const maxDailyFocus = 120;

    const getLevelStyles = (level: number) => {
        if (level >= 100) return "border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 shadow-[0_0_20px_rgba(34,211,238,0.5)]";
        if (level >= 50) return "border-purple-400 bg-purple-50 dark:bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.4)]";
        if (level >= 25) return "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-[0_0_15px_rgba(234,179,8,0.4)]";
        if (level >= 10) return "border-slate-400 bg-slate-50 dark:bg-slate-800 shadow-[0_0_10px_rgba(148,163,184,0.3)]";
        return "border-orange-200 bg-orange-50 dark:bg-orange-900/10"; // Bronze/Default
    };

    const levelStyles = getLevelStyles(level);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Student Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track your progress and achievements.</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className={`p-6 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 relative ${levelStyles}`}>
                        {activeTitle && (
                            <div className="mb-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full border border-yellow-200 text-center whitespace-nowrap">
                                {activeTitle}
                            </div>
                        )}
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-full text-amber-600">
                            <Trophy size={24} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">Level {level}</div>

                        {/* XP Progress Bar */}
                        <div className="w-full max-w-[140px] mt-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                <span>{xp} XP</span>
                                <span>{100 * Math.pow(level, 2)} XP</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(100, Math.max(0, ((xp - (100 * Math.pow(level - 1, 2))) / ((100 * Math.pow(level, 2)) - (100 * Math.pow(level - 1, 2)))) * 100))}%`
                                    }}
                                />
                            </div>
                            <div className="text-[10px] text-center text-slate-400 mt-1">
                                {100 * Math.pow(level, 2) - xp} XP to Level {level + 1}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600">
                            <Star size={24} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{xp} XP</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Total Experience</div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full text-purple-600">
                            <Zap size={24} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{points} pts</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Available Points</div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full text-green-600">
                            <Clock size={24} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalHours}h {(totalFocusMinutes % 60)}m</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Total Focus Time</div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Charts & Inventory */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Productivity Chart */}
                        <div className="w-full">
                            <ProductivityChart />
                        </div>

                        {/* Focus Chart */}
                        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Focus History</h3>
                            <div className="h-64 w-full">
                                <FocusChart />
                            </div>
                        </div>

                        {/* Inventory Section */}
                        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Inventory & Customization</h3>
                            <InventoryGrid />
                        </div>
                    </div>

                    {/* Right Column: Stats & Coupons */}
                    <div className="space-y-8">
                        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">All Time High</h3>
                            <div className="text-4xl font-mono font-bold text-slate-900 dark:text-white">
                                {Math.floor(maxDailyFocus / 60)}<span className="text-lg text-slate-400">h</span> {maxDailyFocus % 60}<span className="text-lg text-slate-400">m</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">Most focus minutes in a single day.</p>
                        </div>

                        {/* Active Coupons */}
                        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Active Coupons</h3>
                            <CouponList />
                        </div>

                        {/* Active Power-ups */}
                        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Active Power-ups</h3>
                            <PowerupList />
                        </div>

                        {/* Placeholder for future stats */}
                        <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg text-white">
                            <h3 className="text-sm font-bold opacity-80 uppercase mb-2">Keep it up!</h3>
                            <p className="text-sm opacity-90">
                                You're doing great. Consistency is key to reaching your goals.
                            </p>
                        </div>

                        {/* Danger Zone */}
                        <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm">
                            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase mb-4">Danger Zone</h3>
                            <p className="text-xs text-red-500 dark:text-red-400/80 mb-4">
                                This will reset all your progress, including habits, tasks, XP, and inventory. This action cannot be undone.
                            </p>
                            <button
                                onClick={async () => {
                                    if (confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
                                        await Promise.all([
                                            useUserStore.getState().resetData(),
                                            useHabitStore.getState().resetData(),
                                            useTaskStore.getState().resetData(),
                                            useShopStore.getState().resetData(),
                                            useJournalStore.getState().resetData(),
                                            useTimerStore.getState().resetData(),
                                            useGoalStore.getState().resetData()
                                        ]);
                                        alert('All data has been reset.');
                                    }
                                }}
                                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm"
                            >
                                Reset All Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
