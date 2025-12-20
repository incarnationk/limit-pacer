'use client';

import { Task, getTaskStatus } from '@/data/mock';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';

interface TaskRedCardProps {
    task: Task;
}

export function TaskRedCard({ task }: TaskRedCardProps) {
    const status = getTaskStatus(task.deadline);

    // Only show for Expired or Urgent
    if (status === 'normal') return null;

    const isExpired = status === 'expired';

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
                "relative p-6 rounded-2xl border-2 shadow-xl overflow-hidden mb-4",
                isExpired
                    ? "bg-red-50 border-red-500 shadow-red-200"
                    : "bg-amber-50 border-amber-500 shadow-amber-200"
            )}
        >
            {/* Background Pulse Animation for expired */}
            {isExpired && (
                <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
            )}

            <div className="relative z-10 flex items-start gap-4">
                <div className={cn(
                    "p-3 rounded-full flex-shrink-0",
                    isExpired ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                )}>
                    <AlertTriangle size={32} strokeWidth={2.5} />
                </div>

                <div className="flex-1">
                    <h3 className={cn(
                        "text-2xl font-bold uppercase tracking-wider mb-1",
                        isExpired ? "text-red-700" : "text-amber-700"
                    )}>
                        {isExpired ? 'Deadline Expired!' : 'Deadline Approaching!'}
                    </h3>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                        {task.content}
                    </p>
                    <div className="flex items-center gap-2 text-gray-600 font-mono text-sm uppercase">
                        <Clock size={16} />
                        <span>Due: {task.deadline}</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <a
                            href={task.link || '#'}
                            target="_blank"
                            className={cn(
                                "inline-flex items-center justify-center px-6 py-2 rounded-full font-bold text-white shadow-lg transform transition active:scale-95",
                                isExpired
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-amber-600 hover:bg-amber-700"
                            )}
                        >
                            Resolve Now
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
