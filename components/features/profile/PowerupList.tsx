'use client';

import { useEffect, useState } from 'react';
import { useShopStore } from '@/lib/store/useShopStore';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export function PowerupList() {
    const { items, inventory, activeItems, consumeItem } = useShopStore();
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Filter for powerups that are owned
    const powerups = items.filter(item =>
        item.type === 'powerup' && inventory.some(i => i.itemId === item.id)
    );

    if (powerups.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No active power-ups. Visit the shop!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {powerups.map(powerup => {
                const quantity = inventory.find(i => i.itemId === powerup.id)?.quantity || 0;
                const activeInstance = activeItems?.find(a => a.itemId === powerup.id && new Date(a.expiresAt).getTime() > now);
                const timeLeft = activeInstance ? Math.max(0, Math.floor((new Date(activeInstance.expiresAt).getTime() - now) / 1000)) : 0;

                const hours = Math.floor(timeLeft / 3600);
                const minutes = Math.floor((timeLeft % 3600) / 60);
                const seconds = timeLeft % 60;

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={powerup.id}
                        className="flex flex-col gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-200 dark:border-purple-800/30 rounded-xl relative overflow-hidden"
                    >
                        {/* Decorative circles for "potion" look */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-950 border-r border-purple-200 dark:border-purple-800/30" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-950 border-l border-purple-200 dark:border-purple-800/30" />

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-full text-purple-500 shadow-sm">
                                <Zap size={20} />
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white text-base">{powerup.name}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{powerup.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pl-14">
                            <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                Owned: {quantity}
                            </div>

                            {activeInstance ? (
                                <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-sm font-bold rounded-lg animate-pulse border border-purple-200 dark:border-purple-800">
                                    Active: {hours > 0 ? `${hours}h ` : ''}{minutes}m {seconds}s
                                </div>
                            ) : (
                                <button
                                    onClick={() => consumeItem(powerup.id, powerup.duration || 0)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                                >
                                    Activate
                                </button>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
