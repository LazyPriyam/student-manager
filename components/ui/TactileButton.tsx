'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { soundManager } from '@/lib/sound';
import { useUserStore } from '@/lib/store/useUserStore';
import { cn } from '@/lib/utils';

interface TactileButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export function TactileButton({
    variant = 'primary',
    size = 'md',
    className,
    children,
    onClick,
    onMouseEnter,
    ...props
}: TactileButtonProps) {
    const { activeSound } = useUserStore();

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        soundManager.playHover(activeSound);
        onMouseEnter?.(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        soundManager.playClick(activeSound);
        onClick?.(e);
    };

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
        secondary: "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
        ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            className={cn(
                "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
}
