'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { Button } from '@/components/ui/Button';
import { soundManager } from '@/lib/sound';

export function DayStartWizard() {
    const { tasks, addTask } = useTaskStore();
    const { activeSound } = useUserStore();
    const [isOpen, setIsOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');

    useEffect(() => {
        // Check if it's a new session/day logic could be here, 
        // but for now we just check if Quadrant 1 is empty.
        // Quadrant 1 is "Do First" (Important & Urgent).
        // We assume tasks have a 'quadrant' property.
        // Let's verify the task structure first, but assuming standard Eisenhower.

        const quadrant1Tasks = tasks.filter(t => t.quadrant === 1);

        if (quadrant1Tasks.length === 0) {
            // Small delay to not overwhelm on immediate load
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [tasks]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;

        // Add to Quadrant 1
        addTask(taskTitle, 1);
        soundManager.playComplete(activeSound);
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-lg w-full text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-6xl mb-6"
                        >
                            ☀️
                        </motion.div>

                        <h1 className="text-4xl font-bold text-white mb-4">
                            Good Morning!
                        </h1>

                        <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                            Let's cut through the noise.<br />
                            What is the <span className="text-yellow-400 font-bold">ONE thing</span> you must accomplish today?
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input
                                autoFocus
                                type="text"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                placeholder="e.g., Finish the project proposal..."
                                className="w-full bg-transparent border-b-2 border-slate-600 text-3xl text-center py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-yellow-400 transition-colors"
                            />

                            <div className="flex justify-center gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsOpen(false)}
                                    className="text-slate-500 hover:text-slate-300"
                                >
                                    I'm just browsing
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!taskTitle.trim()}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg px-8 py-6 rounded-full shadow-lg shadow-yellow-500/20"
                                >
                                    Let's do this! 🚀
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
