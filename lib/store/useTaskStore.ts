import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type Quadrant = 1 | 2 | 3 | 4;

export interface Task {
    id: string;
    title: string;
    quadrant: Quadrant;
}

interface TaskState {
    tasks: Task[];
    addTask: (title: string, quadrant: Quadrant) => void;
    moveTask: (id: string, toQuadrant: Quadrant) => void;
    deleteTask: (id: string) => void;
    fetchTasks: () => Promise<void>;
    resetData: () => Promise<void>;
}

import { supabase } from '@/lib/supabase/client';

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [], // Start empty

    fetchTasks: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id);

        if (tasks) {
            set({
                tasks: tasks.map(t => ({
                    id: t.id,
                    title: t.title,
                    quadrant: (t.priority === 'q1' ? 1 : t.priority === 'q2' ? 2 : t.priority === 'q3' ? 3 : 4) as Quadrant
                }))
            });
        }
    },

    addTask: async (title, quadrant) => {
        const newTask = { id: uuidv4(), title, quadrant };
        set((state) => ({ tasks: [...state.tasks, newTask] }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('tasks').insert({
                id: newTask.id,
                user_id: user.id,
                title,
                priority: `q${quadrant}`
            });
        }
    },

    moveTask: async (id, toQuadrant) => {
        set((state) => ({
            tasks: state.tasks.map(t => t.id === id ? { ...t, quadrant: toQuadrant } : t)
        }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('tasks').update({ priority: `q${toQuadrant}` }).eq('id', id);
        }
    },

    deleteTask: async (id) => {
        set((state) => ({ tasks: state.tasks.filter(t => t.id !== id) }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('tasks').delete().eq('id', id);
        }
    },

    resetData: async () => {
        set({ tasks: [] });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('tasks').delete().eq('user_id', user.id);
        }
    },
}));
