'use client';

import { useState } from 'react';
import { MOCK_MEMBERS, MOCK_TASKS, getTaskStatus } from '@/data/mock';
import { TaskRedCard } from '@/components/dashboard/task-red-card';
import { TaskList } from '@/components/dashboard/task-list';
import { AdminView } from '@/components/dashboard/admin-view';
import { RoleSwitcher } from '@/components/dashboard/role-switcher';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'member' | 'admin'>('member');
  const [tasks, setTasks] = useState(MOCK_TASKS);

  // --- Member View Logic ---
  // Simulate logged-in user: "Suzuki Ichiro" (ID: 2) who has urgent tasks
  const currentUser = MOCK_MEMBERS.find(m => m.id === '2')!;
  const myTasks = tasks.filter(t => t.target === currentUser.role || t.target === '全メンバー');

  // Check for critical tasks (Expired)
  const criticalTasks = myTasks.filter(t => getTaskStatus(t.deadline) === 'expired' && !t.isCompleted);

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    ));
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
            <span className="font-bold text-xl tracking-tight">Limit Pacer</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{viewMode === 'member' ? currentUser.name : 'Administrator'}</p>
              <p className="text-xs text-gray-500">{viewMode === 'member' ? currentUser.role : 'Management'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
              {/* Avatar Placeholder */}
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewMode === 'member' ? 'Suzuki' : 'Admin'}`} alt="avatar" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* VIEW: MEMBER */}
        {viewMode === 'member' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* 1. Red Cards (Only show if Critical) */}
            {criticalTasks.length > 0 && (
              <div className="mb-10">
                <h2 className="text-red-600 font-bold uppercase tracking-widest text-xs mb-4 pl-1">
                  Critical Action Required
                </h2>
                <div className="space-y-4">
                  {criticalTasks.map(task => (
                    <TaskRedCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Task List */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
                  <p className="text-gray-500">Keep up the pace!</p>
                </div>
                <div className="hidden sm:block">
                  {/* Completion Ring Placeholder */}
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    85% Completed
                  </div>
                </div>
              </div>

              <TaskList tasks={myTasks} onToggle={handleToggleTask} />
            </div>
          </motion.div>
        )}

        {/* VIEW: ADMIN */}
        {viewMode === 'admin' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
              <p className="text-gray-500">Monitoring compliance across all teams.</p>
            </div>

            <AdminView members={MOCK_MEMBERS} tasks={tasks} />
          </motion.div>
        )}

      </main>

      {/* Dev Tool: Role Switcher */}
      <RoleSwitcher currentMode={viewMode} onToggle={setViewMode} />
    </div>
  );
}
