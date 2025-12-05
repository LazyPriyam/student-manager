'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface DailyBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DailyBonusModal({ isOpen, onClose }: DailyBonusModalProps) {
    useEffect(() => {
        if (isOpen) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FFD700', '#FFA500'] // Gold colors
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#FFD700', '#FFA500']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                            className="text-6xl mb-4"
                        >
                            🎁
                        </motion.div>

                        <h2 className="text-2xl font-bold text-white mb-2">Daily Bonus!</h2>
                        <p className="text-gray-400 mb-6">
                            You're back! Here's a little something to start your day.
                        </p>

                        <div className="flex justify-center gap-4 mb-8">
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 min-w-[100px]">
                                <div className="text-yellow-400 text-2xl font-bold">+50</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Points</div>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 min-w-[100px]">
                                <div className="text-blue-400 text-2xl font-bold">+10</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">XP</div>
                            </div>
                        </div>

                        <Button
                            onClick={onClose}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
                        >
                            Claim Reward
                        </Button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
