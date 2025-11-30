'use client';

import { HabitList } from '@/components/features/habits/HabitList';
import { useUserStore } from '@/lib/store/useUserStore';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function HabitsPage() {
    const { xp, level } = useUserStore();

    return (
        <main className="min-h-screen flex flex-col p-8 bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Habit Tracker</h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 uppercase">Level {level}</span>
                        <span className="text-sm font-bold text-blue-600">{xp} XP</span>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <HabitList />
            </div>
        </main>
    );
}
