'use client';

import { useState } from 'react';
import { Member, Task, getTaskStatus } from '@/data/mock';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';
import { isTaskVisible } from '@/lib/task-utils';

interface AdminViewProps {
    members: Member[];
    tasks: Task[];
}

export function AdminView({ members, tasks }: AdminViewProps) {
    const [selectedGroup, setSelectedGroup] = useState<string>('all');


    const getMemberStatus = (member: Member) => {
        // Find tasks for this member's role
        const memberTasks = tasks.filter(t => {
            // Check visibility
            if (!isTaskVisible(member.role, t.target)) return false;

            // Check completion (must check t.completedBy array against member.id)
            const isCompleted = t.completedBy && t.completedBy.includes(member.id);
            return !isCompleted;
        });

        // Sort by urgency: Expired first, then Urgent, then Normal
        return memberTasks.sort((a, b) => {
            const priority = { expired: 0, urgent: 1, normal: 2 };
            return priority[getTaskStatus(a.deadline)] - priority[getTaskStatus(b.deadline)];
        });
    };

    // Extract unique groups from members
    const uniqueGroups = Array.from(new Set(members.map(m => m.group).filter(Boolean)));

    // Filter members based on selected group
    const filteredMembers = selectedGroup === 'all'
        ? members
        : members.filter(m => m.group === selectedGroup);

    // Sort filtered members by Team (ascending), then Role (ascending)
    const sortedFilteredMembers = [...filteredMembers].sort((a, b) => {
        // First sort by team
        const teamA = a.team || '';
        const teamB = b.team || '';
        if (teamA !== teamB) {
            return teamA.localeCompare(teamB);
        }
        // Then sort by role
        return a.role.localeCompare(b.role);
    });

    // --- Dynamic Stats Calculation (per Group) ---
    const groupStats = uniqueGroups.map(group => {
        const groupMembers = members.filter(m => m.group === group);


        const redCards = groupMembers.reduce((acc, member) => {
            const pending = getMemberStatus(member);
            const redCount = pending.filter(t => getTaskStatus(t.deadline) === 'expired').length;
            return acc + redCount;
        }, 0);


        let groupAssignments = 0;
        let groupCompleted = 0;

        groupMembers.forEach(member => {
            tasks.forEach(task => {
                if (isTaskVisible(member.role, task.target)) {
                    groupAssignments++;
                    if (task.completedBy && task.completedBy.includes(member.id)) {
                        groupCompleted++;
                    }
                }
            });
        });

        const complianceRate = groupAssignments > 0 ? Math.round((groupCompleted / groupAssignments) * 100) : 100;


        const teamStatus = redCards > 5 ? 'CRT' : redCards > 0 ? 'WRN' : 'SAF';
        const teamStatusColor = redCards > 5 ? 'text-red-600' : redCards > 0 ? 'text-amber-600' : 'text-blue-600';

        return { group, complianceRate, redCards, teamStatus, teamStatusColor };
    });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-3">Compliance Rate</h3>
                    <div className="flex gap-4 flex-wrap">
                        {groupStats.map(({ group, complianceRate }) => (
                            <div key={group} className="text-center">
                                <div className="text-xs text-gray-500 mb-0">{group}</div>
                                <div className="text-lg font-bold text-gray-900">{complianceRate}%</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-3">Red Cards (Active)</h3>
                    <div className="flex gap-4 flex-wrap">
                        {groupStats.map(({ group, redCards }) => (
                            <div key={group} className="text-center">
                                <div className="text-xs text-gray-500 mb-0">{group}</div>
                                <div className="text-2xl font-bold text-red-600">{redCards}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-3">Team Status</h3>
                    <div className="flex gap-2 flex-wrap">
                        {groupStats.map(({ group, teamStatus, teamStatusColor }) => (
                            <div key={group} className="text-center">
                                <div className="text-xs text-gray-500 mb-0">{group}</div>
                                <div className={cn("font-bold text-md", teamStatusColor)}>{teamStatus}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">Team Members Status</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedGroup('all')}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                    selectedGroup === 'all'
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                )}
                            >
                                All
                            </button>
                            {uniqueGroups.map(group => (
                                <button
                                    key={group}
                                    onClick={() => setSelectedGroup(group)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                        selectedGroup === group
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    )}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 border-b">
                                <th className="px-6 py-4 font-medium w-[20%]">Name / Role</th>
                                <th className="px-6 py-4 font-medium w-[10%]">Group</th>
                                <th className="px-6 py-4 font-medium w-[15%]">Team</th>
                                <th className="px-6 py-4 font-medium w-[55%]">Pending Tasks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sortedFilteredMembers.map(member => {
                                const pendingTasks = getMemberStatus(member);
                                const hasRedCard = pendingTasks.some(t => getTaskStatus(t.deadline) === 'expired');

                                return (
                                    <tr key={member.id} className={cn("hover:bg-gray-50 transition-colors", hasRedCard && "bg-red-50/30")}>
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-bold text-gray-900">{member.name}</div>
                                            <div className="text-xs text-gray-500">{member.role}</div>
                                            {hasRedCard && (
                                                <span className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide">
                                                    <AlertTriangle size={10} /> Red Card
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top text-sm text-gray-600">
                                            {member.group}
                                        </td>
                                        <td className="px-6 py-4 align-top text-sm text-gray-600">
                                            {member.team ? `${member.team} チーム` : '-'}
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
