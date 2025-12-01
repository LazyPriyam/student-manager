'use client';

import { useState } from 'react';
import { useShopStore } from '@/lib/store/useShopStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { Reward, RewardType } from '@/lib/data/rewards';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, ShoppingCart, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ShopList() {
    const { items, inventory, purchaseItem } = useShopStore();
    const { level, points, activeTheme, activeSound, activeEffect, activeTitle, setTheme, setSound, setEffect, setTitle } = useUserStore();
    const [activeTab, setActiveTab] = useState<RewardType | 'all'>('all');

    const tabs: { id: RewardType | 'all'; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'sound', label: 'Sounds' },
        { id: 'effect', label: 'Effects' },
        { id: 'title', label: 'Titles' },
        { id: 'coupon', label: 'Coupons' },
        { id: 'powerup', label: 'Power-ups' },
    ];

    const filteredItems = items.filter(item => {
        if (item.type === 'theme') return false; // Explicitly hide themes
        if (activeTab !== 'all' && item.type !== activeTab) return false;
        // Progressive disclosure: only show items up to level + 5
        if (item.unlockLevel > level + 5) return false;
        return true;
    });

    const handlePurchase = (item: Reward) => {
        if (points >= item.cost) {
            purchaseItem(item.id, item.cost);
        }
    };

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
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
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

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredItems.map(item => {
                        const isMystery = item.unlockLevel > level + 1;
                        const isLocked = item.unlockLevel > level;
                        const isOwned = inventory.some(i => i.itemId === item.id) || (item.cost === 0 && !isLocked);
                        const canAfford = points >= item.cost;
                        const equipped = isEquipped(item);

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={item.id}
                                className={`relative p-6 rounded-xl border ${equipped
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                                    } overflow-hidden`}
                            >
                                {isMystery ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                        <HelpCircle className="w-12 h-12 mb-2 opacity-20" />
                                        <span className="text-sm font-bold">Unlocks at Lvl {item.unlockLevel}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="text-3xl">{item.icon}</div>
                                            {isLocked && <Lock className="w-4 h-4 text-slate-400" />}
                                            {isOwned && !equipped && <Check className="w-4 h-4 text-green-500" />}
                                        </div>

                                        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                        <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{item.description}</p>

                                        <div className="flex items-center justify-between mt-auto">
                                            <span className={`font-mono font-bold ${canAfford ? 'text-blue-600' : 'text-slate-400'}`}>
                                                {item.cost > 0 ? `${item.cost} Pts` : 'Free'}
                                            </span>

                                            {isLocked ? (
                                                <Button disabled size="sm" variant="ghost">
                                                    Lvl {item.unlockLevel}
                                                </Button>
                                            ) : isOwned ? (
                                                <Button
                                                    onClick={() => handleEquip(item)}
                                                    disabled={equipped}
                                                    size="sm"
                                                    variant={equipped ? 'outline' : 'default'}
                                                >
                                                    {equipped ? 'Equipped' : 'Equip'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handlePurchase(item)}
                                                    disabled={!canAfford}
                                                    size="sm"
                                                >
                                                    Buy
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
