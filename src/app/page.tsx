'use client';

import { TaskRedCard } from '@/components/dashboard/task-red-card';
import { TaskList } from '@/components/dashboard/task-list';
import { AdminView } from '@/components/dashboard/admin-view';
import { RoleSwitcher } from '@/components/dashboard/role-switcher';
import { motion, AnimatePresence } from 'framer-motion';

import { LoginButton } from '@/components/auth/login-button';
import { useDashboard } from '@/hooks/use-dashboard';
import { getTaskStatus } from '@/data/mock';

export default function DashboardPage() {
  const {
    viewMode,
    setViewMode,
    currentUser,
    members,
    enrichedTasks,
    myTasks,
    isLoading,
    loadError,
    isAuthenticated,
    handleToggleTask
  } = useDashboard();

  const criticalTasks = myTasks.filter(t => t.deadline && getTaskStatus(t.deadline) === 'expired' && !t.isCompleted);

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
