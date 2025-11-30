'use client';

import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { soundManager } from '@/lib/sound';

export function RewardToast() {
    const { notifications, removeNotification } = useNotificationStore();

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <RewardItem key={notification.id} notification={notification} onRemove={removeNotification} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function RewardItem({ notification, onRemove }: { notification: any, onRemove: (id: string) => void }) {
    useEffect(() => {
        // Play sound on mount
        if (notification.type === 'xp') {
            // soundManager.playXpGain(); // Assuming we might add specific sounds later
        } else {
            // soundManager.playCoin();
        }
    }, []);

    const isXp = notification.type === 'xp';
    const Icon = isXp ? Star : Zap;
    const colorClass = isXp ? 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' : 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
    const textColor = isXp ? 'text-blue-700 dark:text-blue-300' : 'text-yellow-700 dark:text-yellow-300';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            layout
            className={`flex items-center gap-3 px-4 py-3 rounded-full border shadow-lg backdrop-blur-md ${colorClass}`}
        >
            <div className={`p-1 rounded-full ${isXp ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white'}`}>
                <Icon size={16} fill="currentColor" />
            </div>
            <div className={`font-bold ${textColor} whitespace-nowrap`}>
                +{notification.amount} {isXp ? 'XP' : 'Points'}
            </div>
        </motion.div>
    );
}
