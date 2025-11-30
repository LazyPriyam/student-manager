'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Quadrant as QuadrantType, Task } from '@/lib/store/useTaskStore';
import { SortableTask } from './SortableTask';
import { cn } from '@/components/ui/Button';

interface QuadrantProps {
    id: QuadrantType;
    title: string;
    description: string;
    tasks: Task[];
    colorClass: string;
}

export function Quadrant({ id, title, description, tasks, colorClass }: QuadrantProps) {
    const { setNodeRef } = useDroppable({
        id: id.toString(),
    });

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className={cn("p-4 border-b border-slate-200 dark:border-slate-800", colorClass)}>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-xs opacity-80">{description}</p>
            </div>

            <div ref={setNodeRef} className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[200px]">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <SortableTask key={task.id} task={task} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        Drop tasks here
                    </div>
                )}
            </div>
        </div>
    );
}
