'use client';

import { ThemeManager } from "@/components/features/settings/ThemeManager";
import { LevelUpModal } from "@/components/features/gamification/LevelUpModal";
import { RewardToast } from "@/components/ui/RewardToast";
import { HelpSystem } from "@/components/features/help/HelpSystem";
import { ActivePowerups } from "@/components/features/gamification/ActivePowerups";
import { FloatingTimer } from "@/components/features/timer/FloatingTimer";
import { GlobalTimerLogic } from "@/components/features/timer/GlobalTimerLogic";
import { useHabitStore } from '@/lib/store/useHabitStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useShopStore } from '@/lib/store/useShopStore';
import { useJournalStore } from '@/lib/store/useJournalStore';
import { useGoalStore } from '@/lib/store/useGoalStore';
import { useTimerStore } from '@/lib/store/useTimerStore';
import { useEffect } from 'react';
import { Header } from "@/components/layout/Header";
import { supabase } from "@/lib/supabase/client";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check streaks and sync data
    useEffect(() => {
        // Initial local check
        useHabitStore.getState().checkStreaks();

        // Sync with DB if user is logged in
        const syncData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await Promise.all([
                    useUserStore.getState().syncWithSupabase(),
                    useHabitStore.getState().fetchHabits(),
                    useTaskStore.getState().fetchTasks(),
                    useShopStore.getState().fetchInventory(),
                    useShopStore.getState().fetchInventory(),
                    useJournalStore.getState().fetchEntries(),
                    useGoalStore.getState().fetchGoals(),
                    useTimerStore.getState().syncWithSupabase()
                ]);
            }
        };

        syncData();

        // Listen for auth changes to re-sync
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                syncData();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <ThemeManager />
            <LevelUpModal />
            <RewardToast />
            <HelpSystem />
            <ActivePowerups />
            <FloatingTimer />
            <GlobalTimerLogic />
            <Header />
            {children}
        </>
    );
}
