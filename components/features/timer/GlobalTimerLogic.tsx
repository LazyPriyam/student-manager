'use client';

import { useEffect, useState, useRef } from 'react';
import { useTimerStore } from '@/lib/store/useTimerStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { useGoalStore } from '@/lib/store/useGoalStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useHabitStore } from '@/lib/store/useHabitStore';
import confetti from 'canvas-confetti';
import { soundManager } from '@/lib/sound';
import { LevelUpModal } from '@/components/features/gamification/LevelUpModal';
import { DailyBonusModal } from '@/components/features/gamification/DailyBonusModal';
import { DayStartWizard } from '@/components/features/onboarding/DayStartWizard';
import LoadingScreen from '@/components/ui/LoadingScreen';

export function GlobalTimerLogic() {
    const {
        timeLeft, isActive, mode, sessionPlan, startTime,
        focusDuration, breakDuration,
        setTimeLeft, setIsActive, setMode, advanceSession, logSession
    } = useTimerStore();
    const { addXp, activeSound, activeEffect, level, isInitialized } = useUserStore();
    const isTaskLoading = useTaskStore(state => state.isLoading);
    const isHabitLoading = useHabitStore(state => state.isLoading);

    const [showDailyBonus, setShowDailyBonus] = useState(false);
    const prevLevelRef = useRef<number | null>(null);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && startTime && timeLeft > 0) {
            // ... (Timer logic remains same)
            let lastTick = Date.now();

            interval = setInterval(() => {
                const now = Date.now();
                const delta = (now - lastTick) / 1000;

                if (delta >= 1) {
                    const secondsPassed = Math.round(delta);
                    if (secondsPassed > 0) {
                        setTimeLeft(Math.max(0, timeLeft - secondsPassed));
                        lastTick = now;
                    }
                }
            }, 1000);

        }

        if (isInitialized && !isInitializedRef.current) {
            isInitializedRef.current = true;
            prevLevelRef.current = level;

            // Check for daily bonus on init
            useUserStore.getState().checkDailyBonus().then((hasBonus) => {
                if (hasBonus) {
                    setShowDailyBonus(true);
                    soundManager.playComplete(activeSound);
                }
            });
        }

        if (timeLeft <= 0 && isActive) {
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
    }, [isActive, timeLeft, mode, sessionPlan, focusDuration, breakDuration, setTimeLeft, setIsActive, setMode, addXp, advanceSession, logSession, activeSound, activeEffect, level, isInitialized]);

    // Show loading screen if any store is loading
    // We check !isInitialized for user store (which is effectively its loading state)
    if (!isInitialized || isTaskLoading || isHabitLoading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <LevelUpModal />
            <DailyBonusModal
                isOpen={showDailyBonus}
                onClose={() => setShowDailyBonus(false)}
            />
            <DayStartWizard />
        </>
    );
}
