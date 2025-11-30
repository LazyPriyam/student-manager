'use client';

import { useState } from 'react';
import { HelpCircle, X, Clock, LayoutGrid, CheckSquare, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HelpSystem() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-lg hover:scale-110 transition-transform"
                aria-label="Help"
            >
                <HelpCircle size={20} />
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">

                        {/* Header */}
                        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                            <h2 className="text-2xl font-bold">How to Use</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                <X size={24} />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-8">

                            {/* Section: Pomodoro */}
                            <div className="flex gap-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl h-fit text-red-600 dark:text-red-400">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Pomodoro Timer</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Use the timer to focus on your work.
                                        <br />
                                        • <span className="font-semibold text-slate-900 dark:text-white">Focus Mode (25m)</span>: Work without distractions.
                                        <br />
                                        • <span className="font-semibold text-slate-900 dark:text-white">Break Mode (5m)</span>: Take a short rest.
                                        <br />
                                        <span className="text-amber-500 font-bold">Reward:</span> Completing a focus session grants <span className="font-bold">50 XP</span>!
                                    </p>
                                </div>
                            </div>

                            {/* Section: Matrix */}
                            <div className="flex gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl h-fit text-blue-600 dark:text-blue-400">
                                    <LayoutGrid size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Eisenhower Matrix</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Prioritize your tasks by dragging them into quadrants:
                                        <br />
                                        • <span className="font-semibold text-green-600">Do First</span>: Urgent & Important.
                                        <br />
                                        • <span className="font-semibold text-blue-600">Schedule</span>: Important, Not Urgent.
                                        <br />
                                        • <span className="font-semibold text-orange-600">Delegate</span>: Urgent, Not Important.
                                        <br />
                                        • <span className="font-semibold text-red-600">Delete</span>: Neither.
                                    </p>
                                </div>
                            </div>

                            {/* Section: Habits */}
                            <div className="flex gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl h-fit text-green-600 dark:text-green-400">
                                    <CheckSquare size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Habit Tracker</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Build consistency with daily habits.
                                        <br />
                                        • <span className="font-semibold text-slate-900 dark:text-white">Streak</span>: Keep the flame alive by checking in daily.
                                        <br />
                                        • <span className="font-semibold text-slate-900 dark:text-white">XP & Points</span>: Earn rewards for every completion.
                                        <br />
                                        • <span className="font-semibold text-slate-900 dark:text-white">Goals</span>: Set start and end dates for your challenges.
                                    </p>
                                </div>
                            </div>

                            {/* Section: Economy */}
                            <div className="flex gap-4">
                                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl h-fit text-amber-600 dark:text-amber-400">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Economy & Rewards</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                        Earn XP to Level Up and Points to spend in the Shop.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <div className="font-bold text-slate-900 dark:text-white">Focus Session</div>
                                            <div className="text-sm text-green-600 dark:text-green-400">+50 XP / 25 mins</div>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <div className="font-bold text-slate-900 dark:text-white">Habit Streak</div>
                                            <div className="text-sm text-green-600 dark:text-green-400">+10 XP + 5 Points</div>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <div className="font-bold text-slate-900 dark:text-white">Level Up</div>
                                            <div className="text-sm text-amber-600 dark:text-amber-400">Unlocks new Shop items</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Shop */}
                            <div className="flex gap-4">
                                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl h-fit text-amber-600 dark:text-amber-400">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Rewards Shop</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Spend your hard-earned Points here!
                                        <br />
                                        • Buy real-life rewards like "Cheat Day" or "15 Min Break".
                                        <br />
                                        • Unlock app themes and other cool bonuses.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
