'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Habit } from '@/lib/store/useHabitStore';
import { HabitItem } from './HabitItem';
import { GripVertical } from 'lucide-react';

interface SortableHabitItemProps {
    habit: Habit;
}

export function SortableHabitItem({ habit }: SortableHabitItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: habit.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2">
            <button
                {...attributes}
                {...listeners}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing p-1"
            >
                <GripVertical size={20} />
            </button>
            <div className="flex-1">
                <HabitItem habit={habit} />
            </div>
        </div>
    );
}
