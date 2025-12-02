'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore, Task } from '@/lib/store/useTaskStore';
import { GripVertical, Check, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface SortableTaskProps {
    task: Task;
}

export function SortableTask({ task }: SortableTaskProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const { completeTask, deleteTask } = useTaskStore();

    const handleComplete = (e: React.MouseEvent) => {
        // Confetti burst at click position
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        confetti({
            origin: { x, y },
            particleCount: 40,
            spread: 60,
            colors: ['#22c55e', '#4ade80', '#86efac', '#ffffff'], // Green shades + white
            disableForReducedMotion: true,
            zIndex: 9999,
            scalar: 0.8,
            drift: 0,
            ticks: 100
        });

        completeTask(task.id);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm group hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
        >
            <button
                {...attributes}
                {...listeners}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing"
            >
                <GripVertical size={16} />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">
                {task.title}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleComplete}
                    className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                    title="Complete Task"
                >
                    <Check size={16} />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.2, rotate: -10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Delete Task"
                >
                    <Trash2 size={16} />
                </motion.button>
            </div>
        </div>
    );
}
