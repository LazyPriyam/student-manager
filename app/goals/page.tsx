'use client';

import { useState } from 'react';
import { useGoalStore } from '@/lib/store/useGoalStore';
import { GoalCard } from '@/components/features/goals/GoalCard';
import { CreateGoalModal } from '@/components/features/goals/CreateGoalModal';
import { Plus, Target } from 'lucide-react';
import { soundManager } from '@/lib/sound';
import { useUserStore } from '@/lib/store/useUserStore';

export default function GoalsPage() {
    const { goals } = useGoalStore();
    const { activeSound } = useUserStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const handleOpenModal = () => {
        soundManager.playClick(activeSound);
        setIsModalOpen(true);
    };

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-24">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <Target className="text-blue-600" />
                            Long-Term Goals
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Set high stakes, track progress, and win big.
                        </p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <Plus size={20} />
                        New Goal
                    </button>
                </div>

                {/* Active Goals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {activeGoals.length > 0 ? (
                        activeGoals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <Target size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Goals</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                                "A goal without a plan is just a wish." Start your journey by creating a new goal today.
                            </p>
                            <button
                                onClick={handleOpenModal}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                Create your first goal
                            </button>
                        </div>
                    )}
                </div>

                {/* Completed History */}
                {completedGoals.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">History</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75 grayscale hover:grayscale-0 transition-all">
                            {completedGoals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} />
                            ))}
                        </div>
                    </section>
                )}

                <CreateGoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
        </main>
    );
}
