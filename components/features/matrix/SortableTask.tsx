'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore, Task } from '@/lib/store/useTaskStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { soundManager } from '@/lib/sound';
import { GripVertical, Check, Trash2, Pencil, X } from 'lucide-react';
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

    const { completeTask, deleteTask, updateTask } = useTaskStore();
    const { activeSound } = useUserStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);

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

        soundManager.playToggle(true, activeSound);
        completeTask(task.id);
    };

    const handleSave = () => {
        if (editTitle.trim()) {
            updateTask(task.id, { title: editTitle });
            setIsEditing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setEditTitle(task.title);
            setIsEditing(false);
        }
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

            <div className="flex-1">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                        />
                        <button onClick={handleSave} className="text-green-600 hover:bg-green-50 p-1 rounded">
                            <Check size={16} />
                        </button>
                        <button onClick={() => { setIsEditing(false); setEditTitle(task.title); }} className="text-red-500 hover:bg-red-50 p-1 rounded">
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 block">
                        {task.title}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isEditing && (
                    <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsEditing(true)}
                        className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title="Edit Task"
                    >
                        <Pencil size={16} />
                    </motion.button>
                )}
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
