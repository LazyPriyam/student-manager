'use client';

import { useEffect } from 'react';
import { useTimerStore } from '@/lib/store/useTimerStore';
import { useUserStore } from '@/lib/store/useUserStore';
import confetti from 'canvas-confetti';
import { soundManager } from '@/lib/sound';

export function GlobalTimerLogic() {
    const {
        timeLeft, isActive, mode, sessionPlan, startTime,
        focusDuration, breakDuration,
        setTimeLeft, setIsActive, setMode, advanceSession, logSession
    } = useTimerStore();
    const { addXp, activeSound, activeEffect } = useUserStore();

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && startTime) {
            // Store the initial duration when the timer started (or resumed)
            // We need to know what the total duration was supposed to be to calculate remaining
            // But timeLeft in store is updated every second.
            // Better approach: When starting, we have a target end time?
            // Or simpler: We have startTime and initial timeLeft at that start.
            // But we don't store "initialTimeLeftAtStart" in store.
            // However, we update timeLeft in store.
            // If we rely on store's timeLeft, it's fine as long as we don't drift.
            // Wait, if we use Date.now(), we need a fixed reference point.
            // The store updates startTime whenever setIsActive(true) is called.
            // So we can calculate: elapsed = Date.now() - startTime.
            // But we need to know what the timeLeft was *when* it started.
            // We don't have that in the store currently.
            // Actually, we can just use the previous timeLeft? No, that changes.
            // Let's assume when we start/resume, we want to count down from the *current* timeLeft.
            // So we need to capture the timeLeft at the moment the effect runs/starts?
            // But this effect runs on every render/update.

            // Let's try a different approach:
            // We trust the store's timeLeft as the "truth" when the component mounts or isActive changes.
            // But for the interval, we should use a local reference to avoid drift *during* this active session.

            // Actually, the most robust way is:
            // When setIsActive(true) is called, we save startTime AND duration (or targetEndTime).
            // We have timer_duration in DB which is the remaining time when paused/started.
            // So: remaining = timer_duration - (Date.now() - timer_start_time) / 1000.
            // This matches exactly what we did in syncWithSupabase!

            // We need to make sure we have the correct 'initial' duration for this session segment.
            // In setIsActive, we save timer_duration = timeLeft.
            // So yes: calculatedTimeLeft = storedTimeLeft - (Date.now() - startTime) / 1000.

            // But we don't have "storedTimeLeft" in the state separate from "timeLeft".
            // "timeLeft" IS the state that gets updated.
            // If we use timeLeft in the calculation, it will feedback loop.

            // Solution: We need to know the "duration to count down from".
            // Let's use a local ref or just rely on the fact that syncWithSupabase sets it correctly?
            // No, we need it live.

            // Let's assume the store's timeLeft is correct when we START.
            // But we need to persist "timeLeftAtStart" to calculate delta.
            // We can't easily add that to store without migration.

            // Alternative: Just use the standard drift-correction:
            // expected = startTime + count * 1000
            // delay = Date.now() - expected

            // Or simpler:
            // Just use the DB logic!
            // We have startTime. We need the duration that was remaining when that startTime was set.
            // We can fetch it? No, too slow.
            // We can add `durationAtStart` to store?
            // Or... we can just use the fact that we update timeLeft every second.
            // If the browser throttles, we miss updates.
            // When we wake up, we see Date.now() has jumped.
            // We can just subtract the *actual elapsed time* since last tick?
            // prevTime = Date.now()
            // interval:
            //   now = Date.now()
            //   delta = (now - prevTime) / 1000
            //   setTimeLeft(timeLeft - delta)
            //   prevTime = now

            // This handles throttling perfectly! If 10 seconds pass, delta is 10, we subtract 10.
            // It doesn't require a fixed start time reference, just relative updates.

            let lastTick = Date.now();

            interval = setInterval(() => {
                const now = Date.now();
                const delta = (now - lastTick) / 1000;

                if (delta >= 1) {
                    // Only update if at least 1 second passed (avoid micro-updates)
                    // Actually, we want to subtract the full float amount? 
                    // No, timeLeft is integer seconds usually.
                    // Let's round delta? Or just subtract 1 and handle drift?
                    // If we just subtract 1, we are back to square one.
                    // We must subtract Math.floor(delta) and keep the remainder?
                    // Or just: setTimeLeft(timeLeft - Math.round(delta))

                    const secondsPassed = Math.round(delta);
                    if (secondsPassed > 0) {
                        setTimeLeft(Math.max(0, timeLeft - secondsPassed));
                        lastTick = now;
                    }
                }
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

    return null; // Logic only, no UI
}
