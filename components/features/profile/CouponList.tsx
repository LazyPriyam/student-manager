'use client';

import { useEffect, useState } from 'react';
import { useShopStore } from '@/lib/store/useShopStore';
import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';

export function CouponList() {
    const { items, inventory, activeItems, consumeItem } = useShopStore();
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Filter for coupons that are owned
    const coupons = items.filter(item =>
        item.type === 'coupon' && inventory.some(i => i.itemId === item.id)
    );

    if (coupons.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No active coupons. Visit the shop!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {coupons.map(coupon => {
                const quantity = inventory.find(i => i.itemId === coupon.id)?.quantity || 0;
                const activeInstance = activeItems?.find(a => a.itemId === coupon.id && new Date(a.expiresAt).getTime() > now);
                const timeLeft = activeInstance ? Math.max(0, Math.floor((new Date(activeInstance.expiresAt).getTime() - now) / 1000)) : 0;

                const hours = Math.floor(timeLeft / 3600);
                const minutes = Math.floor((timeLeft % 3600) / 60);
                const seconds = timeLeft % 60;

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={coupon.id}
                        className="flex flex-col gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl relative overflow-hidden"
                    >
                        {/* Decorative circles for "ticket" look */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-950 border-r border-amber-200 dark:border-amber-800/30" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-950 border-l border-amber-200 dark:border-amber-800/30" />

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-full text-amber-500 shadow-sm">
                                <Ticket size={20} />
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white text-base">{coupon.name}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{coupon.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pl-14">
                            <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                Owned: {quantity}
                            </div>

                            {activeInstance ? (
                                <div className="px-4 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-bold rounded-lg animate-pulse border border-green-200 dark:border-green-800">
                                    Active: {hours > 0 ? `${hours}h ` : ''}{minutes}m {seconds}s
                                </div>
                            ) : (
                                <button
                                    onClick={() => consumeItem(coupon.id, coupon.duration || 0)}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                                >
                                    Use Coupon
                                </button>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
