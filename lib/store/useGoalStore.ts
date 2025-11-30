import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase/client';
import { useUserStore } from './useUserStore';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GoalStatus = 'active' | 'completed' | 'failed';

export interface Milestone {
    id: string;
    goalId: string;
    title: string;
    isCompleted: boolean;
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    difficulty: Difficulty;
    wagerAmount: number;
    status: GoalStatus;
    milestones: Milestone[];
}

interface GoalState {
    goals: Goal[];
    fetchGoals: () => Promise<void>;
    addGoal: (goal: Omit<Goal, 'id' | 'status' | 'milestones'>, milestones: string[]) => Promise<void>;
    toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    resetData: () => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
    goals: [],

    fetchGoals: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: goalsData } = await supabase
            .from('goals')
            .select('*, goal_milestones(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (goalsData) {
            const goals: Goal[] = goalsData.map((g: any) => ({
                id: g.id,
                title: g.title,
                description: g.description,
                startDate: g.start_date,
                endDate: g.end_date,
                difficulty: g.difficulty as Difficulty,
                wagerAmount: g.wager_amount,
                status: g.status as GoalStatus,
                milestones: g.goal_milestones.map((m: any) => ({
                    id: m.id,
                    goalId: m.goal_id,
                    title: m.title,
                    isCompleted: m.is_completed
                }))
            }));
            set({ goals });
        }
    },

    addGoal: async (goalData, milestoneTitles) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Deduct Wager
        if (goalData.wagerAmount > 0) {
            useUserStore.getState().spendPoints(goalData.wagerAmount);
        }

        const newGoalId = uuidv4();
        const newGoal: Goal = {
            id: newGoalId,
            ...goalData,
            status: 'active',
            milestones: milestoneTitles.map(title => ({
                id: uuidv4(),
                goalId: newGoalId,
                title,
                isCompleted: false
            }))
        };

        set(state => ({ goals: [newGoal, ...state.goals] }));

        // Insert Goal
        await supabase.from('goals').insert({
            id: newGoal.id,
            user_id: user.id,
            title: newGoal.title,
            description: newGoal.description,
            start_date: newGoal.startDate,
            end_date: newGoal.endDate,
            difficulty: newGoal.difficulty,
            wager_amount: newGoal.wagerAmount,
            status: 'active'
        });

        // Insert Milestones
        if (newGoal.milestones.length > 0) {
            await supabase.from('goal_milestones').insert(
                newGoal.milestones.map(m => ({
                    id: m.id,
                    goal_id: newGoal.id,
                    title: m.title,
                    is_completed: false
                }))
            );
        }
    },

    toggleMilestone: async (goalId, milestoneId) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal) return;

        const milestone = goal.milestones.find(m => m.id === milestoneId);
        if (!milestone) return;

        const newStatus = !milestone.isCompleted;

        // Update Local State
        set(state => ({
            goals: state.goals.map(g =>
                g.id === goalId
                    ? { ...g, milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, isCompleted: newStatus } : m) }
                    : g
            )
        }));

        // Gamification: Award XP for completing milestone
        if (newStatus) {
            const xpReward = goal.difficulty === 'hard' ? 50 : goal.difficulty === 'medium' ? 30 : 10;
            useUserStore.getState().addXp(xpReward);
        }

        // Check if all milestones are complete -> Complete Goal?
        // For now, we'll let the user manually mark the goal as complete or auto-complete if all milestones done.
        // Let's auto-complete if all milestones are done.
        const updatedGoal = get().goals.find(g => g.id === goalId);
        if (updatedGoal && updatedGoal.milestones.every(m => m.isCompleted)) {
            // Award Goal Completion Reward
            const multiplier = goal.difficulty === 'hard' ? 3 : goal.difficulty === 'medium' ? 2 : 1;
            const basePoints = 100 * multiplier;
            const wagerReward = goal.wagerAmount * 2;

            useUserStore.getState().addPoints(basePoints + wagerReward);
            useUserStore.getState().addXp(basePoints); // Bonus XP

            // Update Goal Status
            set(state => ({
                goals: state.goals.map(g => g.id === goalId ? { ...g, status: 'completed' } : g)
            }));
            await supabase.from('goals').update({ status: 'completed' }).eq('id', goalId);
        }

        // Sync Milestone Status
        await supabase.from('goal_milestones').update({ is_completed: newStatus }).eq('id', milestoneId);
    },

    deleteGoal: async (id) => {
        set(state => ({ goals: state.goals.filter(g => g.id !== id) }));
        await supabase.from('goals').delete().eq('id', id);
    },

    resetData: async () => {
        set({ goals: [] });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('goals').delete().eq('user_id', user.id);
        }
    },
}));
