'use client';

import { useState, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { Member, Task, MOCK_MEMBERS, MOCK_TASKS } from '@/data/mock';
import { fetchExcelTable, mapRowToMember, mapRowToTask, updateTaskCompletionInExcel, EXCEL_CONFIG } from '@/services/excel-client';
import { isTaskVisible } from '@/lib/task-utils';

export function useDashboard() {
    const [viewMode, setViewMode] = useState<'member' | 'admin'>('member');
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
    const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Fetch Data from Excel on Load (if authenticated)
    useEffect(() => {
        async function loadData() {
            if (isAuthenticated && accounts[0]) {
                setIsLoading(true);
                setLoadError(null);
                try {
                    const membersData = await fetchExcelTable(instance, accounts[0], EXCEL_CONFIG.TABLES.MEMBERS);
                    const loadedMembers = membersData.map(mapRowToMember);
                    setMembers(loadedMembers);

                    const tasksData = await fetchExcelTable(instance, accounts[0], EXCEL_CONFIG.TABLES.TASKS);
                    const loadedTasks = tasksData.map(mapRowToTask);
                    setTasks(loadedTasks);
                } catch (e: any) {
                    console.error("Failed to load Excel data", e);
                    setLoadError(`Failed to load data. Details: ${e.message || e}`);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setTasks(MOCK_TASKS);
                setMembers(MOCK_MEMBERS);
            }
        }
        loadData();
    }, [isAuthenticated, instance, accounts]);

    // Logic to identify current user
    const currentUser = members.find(m =>
        isAuthenticated && accounts[0] && accounts[0].username && m.email === accounts[0].username.toLowerCase()
    ) || members[0] || MOCK_MEMBERS[0];

    // Derived state
    const enrichedTasks = tasks.map(t => ({
        ...t,
        isCompleted: t.completedBy ? t.completedBy.includes(currentUser.id) : false
    }));

    const myTasks = enrichedTasks.filter(t => isTaskVisible(currentUser.role, t.target));

    const handleToggleTask = async (taskId: string) => {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = tasks[taskIndex];
        if (!task.completedBy) task.completedBy = [];

        const isCurrentlyCompleted = task.completedBy.includes(currentUser.id);

        let newCompletedBy: string[];
        if (isCurrentlyCompleted) {
            newCompletedBy = task.completedBy.filter(id => id !== currentUser.id);
        } else {
            newCompletedBy = [...task.completedBy, currentUser.id];
        }

        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = { ...task, completedBy: newCompletedBy };
        setTasks(updatedTasks);

        if (isAuthenticated && accounts[0]) {
            try {
                await updateTaskCompletionInExcel(instance, accounts[0], task, newCompletedBy);
            } catch (e) {
                console.error("Sync failed", e);
                setTasks(tasks); // Revert on failure
                alert("Failed to update Excel file.");
            }
        }
    };

    return {
        viewMode,
        setViewMode,
        currentUser,
        tasks,
        members,
        enrichedTasks,
        myTasks,
        isLoading,
        loadError,
        isAuthenticated,
        handleToggleTask
    };
}
