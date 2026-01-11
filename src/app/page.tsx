'use client';

import { useState, useEffect } from 'react';
import { Member, Task, MOCK_MEMBERS, MOCK_TASKS, getTaskStatus } from '@/data/mock';
import { TaskRedCard } from '@/components/dashboard/task-red-card';
import { TaskList } from '@/components/dashboard/task-list';
import { AdminView } from '@/components/dashboard/admin-view';
import { RoleSwitcher } from '@/components/dashboard/role-switcher';
import { motion, AnimatePresence } from 'framer-motion';

import { LoginButton } from '@/components/auth/login-button';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { fetchExcelTable, mapRowToMember, mapRowToTask, updateTaskCompletionInExcel } from '@/services/excel-client';

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'member' | 'admin'>('member');
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  // Initialize with Mock Data ONLY if not authenticated (or purely as initial fallback that gets overwritten)
  // But to avoid "flashing" mock data while loading real data, we might want to start empty if authenticated?
  // Actually, we don't know if we are authenticated immediately on first render (msal loading).
  // Let's stick to MOCK init, but clear it if we detect auth?
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
          // Fetch Members
          const membersData = await fetchExcelTable(instance, accounts[0], 'Start_Members');
          const loadedMembers = membersData.map(mapRowToMember);
          setMembers(loadedMembers);

          // Fetch Tasks
          const tasksData = await fetchExcelTable(instance, accounts[0], 'Start_Tasks');
          const loadedTasks = tasksData.map(mapRowToTask);
          setTasks(loadedTasks);
        } catch (e: any) {
          console.error("Failed to load Excel data", e);
          // Show the specific error from excel-client.ts in the UI
          setLoadError(`Failed to load data. Details: ${e.message || e}`);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Not authenticated -> Ensure Mock Data is present (Reset if logged out)
        setTasks(MOCK_TASKS);
        setMembers(MOCK_MEMBERS);
      }
    }
    loadData();
  }, [isAuthenticated, instance, accounts]);

  // --- Member View Logic ---
  // --- Member View Logic ---
  // Match by Email (ID Token preferred) because Names often differ (e.g. English vs Japanese)
  // We use accounts[0].username which typically holds the email address (UPN)
  const currentUser = members.find(m =>
    isAuthenticated && accounts[0] && accounts[0].username && m.email === accounts[0].username.toLowerCase()
  ) || members[0] || MOCK_MEMBERS[0];

  const enrichedTasks = tasks.map(t => ({
    ...t,
    isCompleted: t.completedBy ? t.completedBy.includes(currentUser.id) : false
  }));

  // Target Definition Logic
  // 全員：全role
  // 管理者：SM、Mgr
  // 役職者：SM、Mgr、AM、L、AL
  // 社員：SM、Mgr、AM、L、AL、T、H
  // Target Definition Logic
  // 全員：全role
  // 管理者：SM、Mgr
  // 役職者：SM、Mgr、AM、L、AL
  // 社員：SM、Mgr、AM、L、AL、T、H
  // BP：BP
  const isTaskVisible = (userRole: string, target: string) => {
    if (target === '全員') return true;
    if (target === userRole) return true; // Direct match

    const roles = {
      管理者: ['SM', 'Mgr'],
      役職者: ['SM', 'Mgr', 'AM', 'L', 'AL'],
      社員: ['SM', 'Mgr', 'AM', 'L', 'AL', 'T', 'H'],
      BP: ['BP']
    };

    // Check if userRole is included in the target group
    const allowedRoles = roles[target as keyof typeof roles] || [];
    return allowedRoles.includes(userRole);
  };

  const myTasks = enrichedTasks.filter(t => isTaskVisible(currentUser.role, t.target));

  // Remove Debug logs
  // console.log("DEBUG: ...");

  const criticalTasks = myTasks.filter(t => t.deadline && getTaskStatus(t.deadline) === 'expired' && !t.isCompleted);

  const handleToggleTask = async (taskId: string) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    if (!task.completedBy) task.completedBy = []; // Safety check

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
        setTasks(tasks); // Revert
        alert("Failed to update Excel file.");
      }
    }
  };


  return (
    <div className="min-h-screen pb-20 bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              L
            </div>
            <span className="font-bold text-xl tracking-tight">期限管理</span>
            {isAuthenticated && !isLoading && !loadError ? (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">Live Data</span>
            ) : !isAuthenticated ? (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">Demo Mode</span>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            <LoginButton displayName={isAuthenticated ? currentUser.name : undefined} />
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {loadError && (
        <div className="max-w-5xl mx-auto px-6 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Connection Error: </strong>
            <span className="block sm:inline">{loadError}</span>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8">
        {isAuthenticated && isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading data from OneDrive...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'member' ? (
              <motion.div
                key="member-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Red Card Section */}
                <AnimatePresence>
                  {criticalTasks.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="space-y-4">
                        {criticalTasks.map(task => (
                          <TaskRedCard key={task.id} task={task} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Task List Header Removed */}

                {/* Task List Component */}
                <TaskList tasks={myTasks} onToggle={handleToggleTask} />
              </motion.div>
            ) : (
              <motion.div
                key="admin-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
                  <p className="text-gray-500">Monitoring compliance across all teams.</p>
                </div>

                <AdminView members={members} tasks={enrichedTasks} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Dev Tool: Role Switcher - Only for Admin Authority */}
      {currentUser.authority === 'admin' && (
        <RoleSwitcher currentMode={viewMode} onToggle={setViewMode} />
      )}
    </div >
  );
}
