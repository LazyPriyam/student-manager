'use client';

import { useEffect, useState } from 'react';
import { useShopStore } from '@/lib/store/useShopStore';
import { motion, AnimatePresence } from 'framer-motion';

export function ActivePowerups() {
    const { activeItems, items } = useShopStore();
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const activePowerups = activeItems
        .map(active => {
            const item = items.find(i => i.id === active.itemId);
            if (!item) return null;
            const expiresAt = new Date(active.expiresAt).getTime();
            const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
            return { ...item, timeLeft, expiresAt };
        })
        .filter(item => item !== null && item.timeLeft > 0)
        .sort((a, b) => a!.timeLeft - b!.timeLeft);

    if (activePowerups.length === 0) return null;

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m ${s}s`;
    };

    return (
        <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {activePowerups.map(item => (
                    <motion.div
                        key={item!.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-3 p-3 bg-slate-900/90 text-white backdrop-blur-md rounded-xl shadow-lg border border-slate-700 pointer-events-auto min-w-[180px]"
                    >
                        <div className="text-2xl">{item!.icon}</div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-300">{item!.name}</span>
                            <span className="text-sm font-mono text-blue-400">
                                {formatTime(item!.timeLeft)}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
