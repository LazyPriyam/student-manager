'use client';

import { useEffect, useState } from 'react';
import { useTimerStore } from '@/lib/store/useTimerStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { soundManager } from '@/lib/sound';

export function Timer() {
    const {
        timeLeft, isActive, mode, sessionPlan, currentSessionIndex,
        focusDuration, breakDuration, longBreakDuration,
        setTimeLeft, setIsActive, setMode, setSessionPlan, advanceSession, logSession, setDurations
    } = useTimerStore();
    const { addXp, activeSound, activeEffect } = useUserStore();
    const [goalHours, setGoalHours] = useState(1);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    // Local state for settings inputs
    const [localFocus, setLocalFocus] = useState(focusDuration);
    const [localBreak, setLocalBreak] = useState(breakDuration);
    const [localLongBreak, setLocalLongBreak] = useState(longBreakDuration);
    const [customTime, setCustomTime] = useState(25);

    // Sync local state with store when store changes (e.g. initial load)
    useEffect(() => {
        setLocalFocus(focusDuration);
        setLocalBreak(breakDuration);
        setLocalLongBreak(longBreakDuration);
    }, [focusDuration, breakDuration, longBreakDuration]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft <= 0 && isActive) {
            setIsActive(false);
            // Timer finished!
            soundManager.playComplete(activeSound);

            if (mode === 'focus') {
                addXp(focusDuration * 2); // Award 2 XP per minute
                logSession(focusDuration);

                // Trigger Active Effect
                if (activeEffect === 'fx-confetti') {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                } else if (activeEffect === 'fx-fireworks') {
                    const duration = 3000;
                    const animationEnd = Date.now() + duration;
                    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
                    const random = (min: number, max: number) => Math.random() * (max - min) + min;

                    const interval: any = setInterval(function () {
                        const timeLeft = animationEnd - Date.now();
                        if (timeLeft <= 0) return clearInterval(interval);
                        const particleCount = 50 * (timeLeft / duration);
                        confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
                        confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
                    }, 250);
                } else if (activeEffect === 'fx-coins') {
                    confetti({ shapes: ['circle'], colors: ['#FFD700'], particleCount: 50, gravity: 2 });
                } else if (activeEffect === 'fx-emojis') {
                    confetti({ shapes: ['square'], scalar: 2, particleCount: 30, colors: ['#FFD700'] });
                } else {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                }
            }

            if (sessionPlan.length > 0) {
                advanceSession();
            } else {
                // Default behavior if no plan
                if (mode === 'focus') {
                    setMode('break');
                    setTimeLeft(breakDuration * 60);
                } else {
                    setMode('focus');
                    setTimeLeft(focusDuration * 60);
                }
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, sessionPlan, focusDuration, breakDuration, setTimeLeft, setIsActive, setMode, addXp, advanceSession, logSession, activeSound, activeEffect]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        if (!isActive) {
            soundManager.playStart(activeSound);
        } else {
            soundManager.playPause(activeSound);
        }
        setIsActive(!isActive);
    };

    const handleResetClick = () => {
        soundManager.playClick(activeSound);
        // If timer is running or paused but has progress (timeLeft < duration)
        const currentDuration = mode === 'focus' ? focusDuration * 60 :
            mode === 'break' ? breakDuration * 60 :
                longBreakDuration * 60;

        if (mode === 'focus' && timeLeft < currentDuration && timeLeft > 0) {
            setIsActive(false);
            setShowSaveDialog(true);
        } else {
            resetTimer();
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setSessionPlan([]); // Clear the plan
        setMode('focus'); // Reset to focus mode
        setTimeLeft(focusDuration * 60); // Reset time
        setShowSaveDialog(false);
    };

    const saveAndReset = () => {
        const currentDuration = focusDuration * 60;
        const elapsedSeconds = currentDuration - timeLeft;
        const elapsedMinutes = Math.floor(elapsedSeconds / 60);

        if (elapsedMinutes > 0) {
            addXp(elapsedMinutes * 2); // Award 2 XP per minute for partial sessions
            logSession(elapsedMinutes);
        }

        resetTimer();
    };

    const handleSettingsChange = () => {
        soundManager.playClick();
        setDurations(localFocus, localBreak, localLongBreak);
        // Also reset timer to new focus duration if currently in focus
        if (mode === 'focus') {
            setTimeLeft(localFocus * 60);
            setIsActive(false);
        }
    };

    const generatePlan = () => {
        soundManager.playClick();
        // Ensure we use the latest settings
        setDurations(localFocus, localBreak, localLongBreak);

        const plan: ('focus' | 'break' | 'long-break')[] = [];
        const totalMinutes = goalHours * 60;
        let accumulated = 0;
        let focusCount = 0;

        while (accumulated < totalMinutes) {
            plan.push('focus');
            accumulated += localFocus;
            focusCount++;

            if (accumulated >= totalMinutes) break;

            if (focusCount % 4 === 0) {
                plan.push('long-break');
                accumulated += localLongBreak;
            } else {
                plan.push('break');
                accumulated += localBreak;
            }
        }
        setSessionPlan(plan);
        setMode('focus');
        setTimeLeft(localFocus * 60);
    };

    const setCustomDuration = () => {
        soundManager.playClick();
        setTimeLeft(customTime * 60);
        setIsActive(false);
    };

    return (
        <div className="relative flex flex-col items-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 w-full max-w-md mx-auto transition-all">

            {/* Save Session Dialog */}
            <AnimatePresence>
                {showSaveDialog && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center"
                    >
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">End Session Early?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            You have elapsed time. Do you want to log it before resetting?
                        </p>
                        <div className="flex gap-3 w-full">
                            <Button onClick={resetTimer} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20">
                                Discard
                            </Button>
                            <Button onClick={saveAndReset} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                                Save & Reset
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between w-full mb-6">
                <h2 className="text-2xl font-bold capitalize text-slate-900 dark:text-white">{mode.replace('-', ' ')} Mode</h2>
                {sessionPlan.length > 0 && (
                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full">
                        Session {currentSessionIndex + 1}/{sessionPlan.length}
                    </span>
                )}
            </div>

            <motion.div
                className="text-7xl font-mono mb-8 font-bold tracking-wider text-blue-600 dark:text-blue-400 drop-shadow-sm cursor-default select-none"
                animate={{
                    scale: isActive ? [1, 1.05, 1] : 1,
                    opacity: isActive ? [1, 0.8, 1] : 1
                }}
                transition={{
                    duration: 2,
                    repeat: isActive ? Infinity : 0,
                    ease: "easeInOut"
                }}
            >
                {formatTime(timeLeft)}
            </motion.div>

            <div className="flex gap-4 mb-8 w-full">
                <Button onClick={toggleTimer} className="flex-1 h-12 text-lg">
                    {isActive ? 'Pause' : 'Start Focus'}
                </Button>
                <Button onClick={handleResetClick} variant="outline" className="h-12 w-12 p-0">
                    ↺
                </Button>
            </div>

            {/* Advanced Controls */}
            <div className="w-full space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">

                {/* Settings Section */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Focus</label>
                        <input
                            type="number"
                            value={localFocus}
                            onChange={(e) => setLocalFocus(Number(e.target.value))}
                            className="w-full px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                            min={1}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Break</label>
                        <input
                            type="number"
                            value={localBreak}
                            onChange={(e) => setLocalBreak(Number(e.target.value))}
                            className="w-full px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                            min={1}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Long Break</label>
                        <input
                            type="number"
                            value={localLongBreak}
                            onChange={(e) => setLocalLongBreak(Number(e.target.value))}
                            className="w-full px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                            min={1}
                        />
                    </div>
                </div>
                <Button onClick={handleSettingsChange} variant="ghost" size="sm" className="w-full text-xs text-slate-400 h-6">
                    Update Default Durations
                </Button>

                {/* Planning Section */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Session Goal (Hours)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={goalHours}
                            onChange={(e) => setGoalHours(Number(e.target.value))}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                            min={1} max={12}
                        />
                        <Button onClick={generatePlan} variant="outline" className="whitespace-nowrap">
                            Generate Plan
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Custom Timer (Mins)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={customTime}
                            onChange={(e) => setCustomTime(Number(e.target.value))}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                            min={1} max={120}
                        />
                        <Button onClick={setCustomDuration} variant="outline" className="whitespace-nowrap">
                            Set Time
                        </Button>
                    </div>
                </div>
            </div>

            {/* Session Plan Review */}
            {sessionPlan.length > 0 && (
                <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Session Plan</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {sessionPlan.map((type, index) => (
                            <div
                                key={index}
                                className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-16 rounded-lg border text-xs font-medium transition-colors ${index === currentSessionIndex
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                                    : index < currentSessionIndex
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
                                        : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
                                    }`}
                            >
                                <span className="capitalize">{type.replace('-', ' ')}</span>
                                <span className="opacity-70 text-[10px]">
                                    {type === 'focus'
                                        ? `${localFocus}m`
                                        : type === 'long-break'
                                            ? `${localLongBreak}m`
                                            : `${localBreak}m`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
