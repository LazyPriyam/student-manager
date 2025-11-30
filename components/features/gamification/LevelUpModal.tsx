'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/lib/store/useUserStore';
import { REWARDS } from '@/lib/data/rewards';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Star, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '@/lib/sound';

export function LevelUpModal() {
    const { level } = useUserStore();
    const [prevLevel, setPrevLevel] = useState(level);
    const [isOpen, setIsOpen] = useState(false);
    const [showUnlock, setShowUnlock] = useState(false);

    useEffect(() => {
        if (level > prevLevel) {
            setIsOpen(true);
            soundManager.playComplete(); // Play a sound
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 }
            });
            // Reset state for animation
            setShowUnlock(false);

            // Trigger unlock animation after a delay
            setTimeout(() => {
                setShowUnlock(true);
                soundManager.playClick(); // Sound for lock breaking
            }, 1000);
        }
        setPrevLevel(level);
    }, [level, prevLevel]);

    const unlockedItems = REWARDS.filter(r => r.unlockLevel === level);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl"
                    >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl pointer-events-none" />

                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative z-10"
                        >
                            <h2 className="text-3xl font-bold text-white mb-2">Level Up!</h2>
                            <div className="text-6xl font-black text-blue-400 mb-2 drop-shadow-lg">
                                {level}
                            </div>
                            <div className="text-xl font-bold text-yellow-400 mb-6 flex items-center justify-center gap-2">
                                <Zap size={24} className="fill-yellow-400" />
                                +100 Points
                            </div>
                        </motion.div>

                        {/* Lock Animation */}
                        <div className="relative h-24 mb-6 flex items-center justify-center">
                            <AnimatePresence mode='wait'>
                                {!showUnlock ? (
                                    <motion.div
                                        key="locked"
                                        initial={{ scale: 1 }}
                                        exit={{ scale: 1.5, opacity: 0, rotate: 10 }}
                                        className="text-slate-500"
                                    >
                                        <Lock size={64} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="unlocked"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1, rotate: [0, -10, 10, 0] }}
                                        className="text-amber-400"
                                    >
                                        <Unlock size={64} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Unlocked Items List */}
                        <AnimatePresence>
                            {showUnlock && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-4 relative z-10"
                                >
                                    <p className="text-slate-300 font-medium">New Rewards Unlocked:</p>
                                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                                        {unlockedItems.length > 0 ? (
                                            unlockedItems.map(item => (
                                                <div key={item.id} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-left">
                                                    <span className="text-2xl">{item.icon}</span>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{item.name}</div>
                                                        <div className="text-xs text-slate-400 capitalize">{item.type}</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-slate-500 italic text-sm">
                                                No specific items this level, but you're getting stronger!
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                                    >
                                        Awesome!
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
