'use client';

import { useState } from 'react';
import { useShopStore } from '@/lib/store/useShopStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { Reward, RewardType } from '@/lib/data/rewards';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function InventoryGrid() {
    const { items, inventory } = useShopStore();
    const { activeTheme, activeSound, activeEffect, activeTitle, setTheme, setSound, setEffect, setTitle, level } = useUserStore();
    const [activeTab, setActiveTab] = useState<RewardType>('theme');

    const tabs: { id: RewardType; label: string }[] = [
        { id: 'theme', label: 'Themes' },
        { id: 'sound', label: 'Sounds' },
        { id: 'effect', label: 'Effects' },
        { id: 'title', label: 'Titles' },
    ];

    // Filter items: Must be of the active tab type AND be in inventory (or free AND unlocked)
    const ownedItems = items.filter(item =>
        item.type === activeTab && (inventory.includes(item.id) || (item.cost === 0 && level >= item.unlockLevel))
    );

    const handleEquip = (item: Reward) => {
        switch (item.type) {
            case 'theme': setTheme(item.id); break;
            case 'sound': setSound(item.id); break;
            case 'effect': setEffect(item.id); break;
            case 'title': setTitle(item.id); break;
        }
    };

    const isEquipped = (item: Reward) => {
        switch (item.type) {
            case 'theme': return activeTheme === item.id;
            case 'sound': return activeSound === item.id;
            case 'effect': return activeEffect === item.id;
            case 'title': return activeTitle === item.id;
            default: return false;
        }
    };

    return (
        <div className="w-full">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map(tab => (
                    <Button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        variant={activeTab === tab.id ? 'default' : 'outline'}
                        className="whitespace-nowrap"
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            {ownedItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p>You haven't unlocked any {activeTab}s yet.</p>
                    <p className="text-sm mt-2">Visit the shop to unlock more!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                        {ownedItems.map(item => {
                            const equipped = isEquipped(item);
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={item.id}
                                    className={`relative p-4 rounded-xl border transition-all ${equipped
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="text-2xl">{item.icon}</div>
                                        {equipped && <Check className="w-4 h-4 text-blue-600" />}
                                    </div>

                                    <h4 className="font-bold text-sm mb-1">{item.name}</h4>
                                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 h-8">{item.description}</p>

                                    <Button
                                        onClick={() => handleEquip(item)}
                                        disabled={equipped}
                                        size="sm"
                                        variant={equipped ? 'outline' : 'default'}
                                        className="w-full"
                                    >
                                        {equipped ? 'Equipped' : 'Equip'}
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
