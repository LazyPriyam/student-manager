'use client';

import { ShopList } from '@/components/features/shop/ShopList';
import { useUserStore } from '@/lib/store/useUserStore';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Coins } from 'lucide-react';

export default function ShopPage() {
    const { xp, level, points } = useUserStore();

    return (
        <main className="min-h-screen flex flex-col p-8 bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Rewards Shop</h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/20 rounded-full text-amber-600 dark:text-amber-400 font-bold">
                        <Coins size={20} />
                        <span>{points} Points</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 uppercase">Level {level}</span>
                        <span className="text-sm font-bold text-blue-600">{xp} XP</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex justify-center">
                <ShopList />
            </div>
        </main>
    );
}
