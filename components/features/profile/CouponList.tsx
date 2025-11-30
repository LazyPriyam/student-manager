'use client';

import { useShopStore } from '@/lib/store/useShopStore';
import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';

export function CouponList() {
    const { items, inventory } = useShopStore();

    // Filter for coupons that are owned
    const coupons = items.filter(item =>
        item.type === 'coupon' && inventory.some(i => i.itemId === item.id)
    );

    if (coupons.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No active coupons.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map(coupon => {
                const quantity = inventory.find(i => i.itemId === coupon.id)?.quantity || 0;
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={coupon.id}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl relative overflow-hidden"
                    >
                        {/* Decorative circles for "ticket" look */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-950 border-r border-amber-200 dark:border-amber-800/30" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-950 border-l border-amber-200 dark:border-amber-800/30" />

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-full text-amber-500 shadow-sm">
                            <Ticket size={20} />
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{coupon.name}</h4>
                            <p className="text-xs text-slate-500">{coupon.description}</p>
                            <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                ACTIVE (x{quantity})
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
