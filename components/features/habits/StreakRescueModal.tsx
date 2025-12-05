'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useShopStore } from '@/lib/store/useShopStore';
import { useHabitStore } from '@/lib/store/useHabitStore';
import { useEffect, useState } from 'react';
import { soundManager } from '@/lib/sound';
import { useUserStore } from '@/lib/store/useUserStore';

export function StreakRescueModal() {
    const { inventory } = useShopStore();
    const { checkStreakFreeze, applyStreakFreeze, habits } = useHabitStore();
    const { activeSound } = useUserStore();

    const [atRiskHabitId, setAtRiskHabitId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkForRisk = async () => {
            // Check if user has a Streak Freeze
            const hasFreeze = inventory.some(item => item.itemId === 'power-freeze' && item.quantity > 0);
            if (!hasFreeze) return;

            const atRiskIds = await checkStreakFreeze();
            if (atRiskIds.length > 0) {
                // Just take the first one for now to keep it simple
                setAtRiskHabitId(atRiskIds[0]);
                setIsOpen(true);
                soundManager.playStart(activeSound);
            }
        };

        checkForRisk();
    }, [inventory, checkStreakFreeze, activeSound]);

    const handleRescue = async () => {
        if (atRiskHabitId) {
            await applyStreakFreeze(atRiskHabitId);
            soundManager.playComplete(activeSound);
            setIsOpen(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const habitName = habits.find(h => h.id === atRiskHabitId)?.title || 'your habit';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-slate-900 border border-blue-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
                    >
                        {/* Icy Background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

                        <div className="text-6xl mb-4 animate-bounce">
                            ❄️
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Streak At Risk!</h2>
                        <p className="text-slate-300 mb-6">
                            You missed a day on <span className="text-blue-400 font-bold">{habitName}</span>.
                            <br />
                            Use a <span className="font-bold text-white">Streak Freeze</span> to save it?
                        </p>

                        <div className="flex gap-4">
                            <Button
                                onClick={handleClose}
                                variant="ghost"
                                className="flex-1 text-slate-400 hover:text-white"
                            >
                                Let it go
                            </Button>
                            <Button
                                onClick={handleRescue}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3"
                            >
                                Use Freeze (-1)
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
