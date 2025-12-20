'use client';

import { useState } from 'react';
import { Task, getTaskStatus } from '@/data/mock';
import { cn } from '@/lib/utils';
import { CheckCircle2, ChevronDown, ChevronUp, Circle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskListProps {
    tasks: Task[];
    onToggle: (taskId: string) => void;
}

export function TaskList({ tasks, onToggle }: TaskListProps) {
    const [showCompleted, setShowCompleted] = useState(false);

    // Split tasks (Mock logic: Assuming tasks without isCompleted are Todo)
    // In a real app, this would filter by the logged-in user too.
    const todoTasks = tasks.filter(t => !t.isCompleted);
    const completedTasks = tasks.filter(t => t.isCompleted);

    return (
        <div className="space-y-6">
            {/* TODO Section */}
            <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Circle className="text-blue-500" size={20} />
                    To Do <span className="text-gray-400 text-sm ml-2">({todoTasks.length})</span>
                </h2>
                <div className="space-y-3">
                    {todoTasks.map(task => (
                        <TaskItem key={task.id} task={task} onToggle={() => onToggle(task.id)} />
                    ))}
                    {todoTasks.length === 0 && (
                        <p className="text-gray-400 italic p-4 bg-gray-50 rounded-lg text-center">
                            No active tasks. Good job!
                        </p>
                    )}
                </div>
            </section>

            {/* Completed Section (Accordion) */}
            <section>
                <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium text-sm w-full py-2 border-b"
                >
                    {showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    Completed Tasks ({completedTasks.length})
                </button>

                <AnimatePresence>
                    {showCompleted && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-3 pb-4">
                                {completedTasks.map(task => (
                                    <TaskItem key={task.id} task={task} isCompleted onToggle={() => onToggle(task.id)} />
                                ))}
                                {completedTasks.length === 0 && (
                                    <p className="text-gray-400 text-sm p-2">No completed tasks yet.</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
}

function TaskItem({ task, isCompleted, onToggle }: { task: Task, isCompleted?: boolean, onToggle: () => void }) {
    const status = getTaskStatus(task.deadline);

    return (
        <div className={cn(
            "p-4 rounded-xl border transition-all flex items-start gap-4 group",
            isCompleted
                ? "bg-gray-50 border-gray-200 opacity-60"
                : "bg-white border-gray-200 hover:shadow-md"
        )}>
            <div className="mt-1">
                <button
                    onClick={onToggle}
                    className="focus:outline-none transition-transform active:scale-95"
                    title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                >
                    {isCompleted ? (
                        <CheckCircle2 className="text-green-500" size={24} />
                    ) : (
                        <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center hover:bg-gray-50",
                            status === 'expired' ? "border-red-500" :
                                status === 'urgent' ? "border-amber-500" :
                                    "border-gray-300"
                        )}>
                            {/* Hover effect to show 'check' hint */}
                            <div className="w-3 h-3 rounded-full bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                </button>
            </div>

            <div className="flex-1">
                <h4 className={cn("font-semibold", isCompleted && "line-through text-gray-500")}>
                    {task.content}
                </h4>
                <div className="flex items-center gap-4 text-sm mt-1 text-gray-500">
                    <span>Deadline: <span className={cn(
                        !isCompleted && status === 'expired' && "text-red-600 font-bold",
                        !isCompleted && status === 'urgent' && "text-amber-600 font-bold"
                    )}>{task.deadline}</span></span>
                    {task.target && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{task.target}</span>}
                </div>
            </div>

            {task.link && (
                <a
                    href={task.link}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                    <ExternalLink size={18} />
                </a>
            )}
        </div>
    );
}
