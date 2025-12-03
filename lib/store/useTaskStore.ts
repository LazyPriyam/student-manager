import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type Quadrant = 1 | 2 | 3 | 4;

export interface Task {
    id: string;
    title: string;
    quadrant: Quadrant;
    dueDate?: string;
    position?: number;
}

interface TaskState {
    tasks: Task[];
    addTask: (title: string, quadrant: Quadrant) => Promise<void>;
    moveTask: (id: string, toQuadrant: Quadrant) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    reorderTasks: (activeId: string, overId: string) => Promise<void>;
    fetchTasks: () => Promise<void>;
    completeTask: (id: string) => Promise<void>;
    history: { date: string; count: number }[];
    resetData: () => Promise<void>;
}

import { supabase } from '@/lib/supabase/client';

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [], // Start empty
    history: [],

    fetchTasks: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id);

        if (tasks) {
            const now = new Date().toISOString();
            const tasksToDelete: string[] = [];

            const validTasks = tasks.filter(t => {
                // Check if task is in Q4 (Delete) and expired
                const isQ4 = t.priority === 'q4';
                const isExpired = t.due_date && t.due_date < now;

                if (isQ4 && isExpired) {
                    tasksToDelete.push(t.id);
                    return false;
                }
                return true;
            });

            // Async delete expired tasks
            if (tasksToDelete.length > 0) {
                await supabase.from('tasks').delete().in('id', tasksToDelete);
            }

            set({
                tasks: validTasks.map(t => ({
                    id: t.id,
                    title: t.title,
                    quadrant: (t.priority === 'q1' ? 1 : t.priority === 'q2' ? 2 : t.priority === 'q3' ? 3 : 4) as Quadrant,
                    dueDate: t.due_date
                }))
            });
        }

        // Fetch History
        const { data: historyData } = await supabase
            .from('task_history')
            .select('completed_at')
            .eq('user_id', user.id);

        if (historyData) {
            const historyMap = new Map<string, number>();
            historyData.forEach(h => {
                const date = new Date(h.completed_at).toISOString().split('T')[0];
                historyMap.set(date, (historyMap.get(date) || 0) + 1);
            });

            const history = Array.from(historyMap.entries()).map(([date, count]) => ({ date, count }));
            set({ history });
        }
    },

    addTask: async (title, quadrant) => {
        const dueDate = quadrant === 4
            ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            : null;

        const newTask: Task = {
            id: uuidv4(),
            title,
            quadrant,
            dueDate: dueDate || undefined
        };

        set((state) => ({ tasks: [...state.tasks, newTask] }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('tasks').insert({
                id: newTask.id,
                user_id: user.id,
                title,
                priority: `q${quadrant}`,
                due_date: dueDate
            });
        }
    },

    moveTask: async (id, toQuadrant) => {
        const dueDate = toQuadrant === 4
            ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            : null;

        set((state) => ({
            tasks: state.tasks.map(t => t.id === id ? { ...t, quadrant: toQuadrant, dueDate: dueDate || undefined } : t)
        }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('tasks').update({
                priority: `q${toQuadrant}`,
                due_date: dueDate
            }).eq('id', id);
        }
    },

    deleteTask: async (id) => {
        set((state) => ({ tasks: state.tasks.filter(t => t.id !== id) }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('tasks').delete().eq('id', id);
        }
    },

    updateTask: async (id, updates) => {
        set((state) => ({
            tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
        }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const dbUpdates: any = {};
            if (updates.title) dbUpdates.title = updates.title;
            if (updates.quadrant) dbUpdates.priority = `q${updates.quadrant}`;

            if (Object.keys(dbUpdates).length > 0) {
                await supabase.from('tasks').update(dbUpdates).eq('id', id);
            }
        }
    },

    reorderTasks: async (activeId, overId) => {
        set((state) => {
            const oldIndex = state.tasks.findIndex((t) => t.id === activeId);
            const newIndex = state.tasks.findIndex((t) => t.id === overId);

            if (oldIndex === -1 || newIndex === -1) return state;

            const newTasks = [...state.tasks];
            const [movedTask] = newTasks.splice(oldIndex, 1);
            newTasks.splice(newIndex, 0, movedTask);

            return { tasks: newTasks };
        });

        // Sync positions to DB (debounced or simple loop)
        const { tasks } = get();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // We only need to update the positions of the tasks that changed, 
            // but for simplicity and correctness in this prototype, we can update all or just the affected range.
            // A better approach for DB is to just update the 'position' field.
            // For now, let's just assume we update the position based on index.
            // Note: This might be heavy if we have many tasks.

            const updates = tasks.map((t, index) => ({
                id: t.id,
                user_id: user.id,
                title: t.title,
                position: index
            }));

            await supabase.from('tasks').upsert(updates, { onConflict: 'id' });
        }
    },

    completeTask: async (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        // Optimistic update
        set((state) => {
            const today = new Date().toISOString().split('T')[0];
            const newHistory = [...state.history];
            const existingEntry = newHistory.find(h => h.date === today);
            if (existingEntry) {
                existingEntry.count++;
            } else {
                newHistory.push({ date: today, count: 1 });
            }
            return {
                tasks: state.tasks.filter(t => t.id !== id),
                history: newHistory
            };
        });

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Insert into history
            await supabase.from('task_history').insert({
                user_id: user.id,
                title: task.title,
                priority: `q${task.quadrant}`,
                completed_at: new Date().toISOString()
            });

            // Delete from active tasks
            await supabase.from('tasks').delete().eq('id', id);
        }
    },

    resetData: async () => {
        set({ tasks: [], history: [] });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('tasks').delete().eq('user_id', user.id);
            await supabase.from('task_history').delete().eq('user_id', user.id);
        }
    },
}));
