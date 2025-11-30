'use client';

import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { useTaskStore, Quadrant as QuadrantType } from '@/lib/store/useTaskStore';
import { Quadrant } from './Quadrant';
import { SortableTask } from './SortableTask';

export function EisenhowerMatrix() {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const { tasks, moveTask, addTask } = useTaskStore();
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask(newTaskTitle, 1); // Default to Quadrant 1
        setNewTaskTitle('');
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getTasksByQuadrant = (q: QuadrantType) => tasks.filter(t => t.quadrant === q);
    const activeTask = tasks.find(t => t.id === activeId);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        // Find the container (quadrant) we are hovering over
        // If hovering over a task, find its quadrant. If hovering over a container, use its ID.
        // Note: In this simple implementation, we rely on DragEnd for the final move logic.
        // DragOver is useful for visual feedback if we were reordering lists locally before commit.
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeTask = tasks.find(t => t.id === active.id);
        if (!activeTask) return;

        // Determine target quadrant
        // If dropped on a Quadrant container (id is "1", "2", "3", "4")
        let targetQuadrant: QuadrantType | null = null;

        if (['1', '2', '3', '4'].includes(over.id as string)) {
            targetQuadrant = parseInt(over.id as string) as QuadrantType;
        } else {
            // If dropped on another task, find that task's quadrant
            const overTask = tasks.find(t => t.id === over.id);
            if (overTask) {
                targetQuadrant = overTask.quadrant;
            }
        }

        if (targetQuadrant && activeTask.quadrant !== targetQuadrant) {
            moveTask(activeTask.id, targetQuadrant);
        }

        setActiveId(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="w-full max-w-6xl mb-8">
                <form onSubmit={handleAddTask} className="flex gap-4">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 px-4 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                        Add Task
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl h-auto md:h-[800px]">
                <Quadrant
                    id={1}
                    title="Do First"
                    description="Urgent & Important"
                    tasks={getTasksByQuadrant(1)}
                    colorClass="bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-200"
                />
                <Quadrant
                    id={2}
                    title="Schedule"
                    description="Not Urgent & Important"
                    tasks={getTasksByQuadrant(2)}
                    colorClass="bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200"
                />
                <Quadrant
                    id={3}
                    title="Delegate"
                    description="Urgent & Not Important"
                    tasks={getTasksByQuadrant(3)}
                    colorClass="bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200"
                />
                <Quadrant
                    id={4}
                    title="Delete"
                    description="Not Urgent & Not Important"
                    tasks={getTasksByQuadrant(4)}
                    colorClass="bg-slate-100 text-slate-900 dark:bg-slate-800/50 dark:text-slate-300"
                />
            </div>

            <DragOverlay>
                {activeTask ? <SortableTask task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
