'use client';

import Link from 'next/link';
import { Timer } from '@/components/features/timer/Timer';
import { EisenhowerMatrix } from '@/components/features/matrix/EisenhowerMatrix';
import { HabitList } from '@/components/features/habits/HabitList';
import { ShoppingBag, LayoutGrid, CheckSquare, User } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-24 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Student Manager</h1>
          <p className="text-slate-500 dark:text-slate-400">Focus, prioritize, and level up.</p>
        </div>

        {/* Timer Section */}
        <section className="flex flex-col items-center gap-8">
          <Timer />
        </section>



        {/* Grid Layout for Matrix and Habits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Eisenhower Matrix */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <LayoutGrid className="text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Priority Matrix</h2>
            </div>
            <EisenhowerMatrix />
          </section>

          {/* Habit Tracker */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="text-green-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Habits</h2>
            </div>
            <HabitList />
          </section>

        </div>
      </div>
    </main>
  );
}
