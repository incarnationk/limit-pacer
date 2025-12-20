'use client';

import { Member, Task, getTaskStatus } from '@/data/mock';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';

interface AdminViewProps {
    members: Member[];
    tasks: Task[];
}

export function AdminView({ members, tasks }: AdminViewProps) {
    const getMemberStatus = (member: Member) => {
        // Find tasks for this member's role (or 'All')
        const memberTasks = tasks.filter(t =>
            !t.isCompleted && (t.target === member.role || t.target === '全メンバー')
        );

        // Sort by urgency: Expired first, then Urgent, then Normal
        return memberTasks.sort((a, b) => {
            const priority = { expired: 0, urgent: 1, normal: 2 };
            return priority[getTaskStatus(a.deadline)] - priority[getTaskStatus(b.deadline)];
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Compliance Rate</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">82%</p>
                    <div className="text-green-600 text-sm mt-1">↑ 4% vs last week</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Red Cards (Active)</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">3</p>
                    <div className="text-red-800 text-sm mt-1">Action Required</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Team Status</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">Safe</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-bold">Team Members Status</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 border-b">
                                <th className="px-6 py-4 font-medium w-1/4">Name / Role</th>
                                <th className="px-6 py-4 font-medium w-3/4">Pending Tasks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {members.map(member => {
                                const pendingTasks = getMemberStatus(member);
                                const hasRedCard = pendingTasks.some(t => getTaskStatus(t.deadline) === 'expired');

                                return (
                                    <tr key={member.id} className={cn("hover:bg-gray-50 transition-colors", hasRedCard && "bg-red-50/30")}>
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-bold text-gray-900">{member.name}</div>
                                            <div className="text-xs text-gray-500">{member.role} | {member.team}</div>
                                            {hasRedCard && (
                                                <span className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide">
                                                    <AlertTriangle size={10} /> Red Card
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {pendingTasks.length > 0 ? (
                                                <div className="space-y-2">
                                                    {pendingTasks.map(task => {
                                                        const status = getTaskStatus(task.deadline);
                                                        return (
                                                            <div key={task.id} className="flex items-start gap-2">
                                                                <div className={cn(
                                                                    "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                                                                    status === 'expired' ? "bg-red-500" :
                                                                        status === 'urgent' ? "bg-amber-500" :
                                                                            "bg-gray-300"
                                                                )} />
                                                                <div>
                                                                    <span className={cn("font-medium", status === 'expired' && "text-red-700")}>
                                                                        {task.content}
                                                                    </span>
                                                                    <div className="text-xs text-gray-400">
                                                                        Due: {task.deadline}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                    <CheckCircle size={14} /> All Clear
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
