// src/pages/Client/TaskManagement.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ListChecks } from 'lucide-react';

import PostATask from './PostATask';
import UserTasks from './UserTasks';

const TABS = [
  { id: 'post', label: 'Post a Task', shortLabel: 'Post', icon: Send },
  { id: 'myTasks', label: 'My Tasks', shortLabel: 'My Tasks', icon: ListChecks },
];

const TaskManagement = () => {
  const [activeTab, setActiveTab] = useState('post');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ===== Header ===== */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 pt-10 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Task Management</h1>
          <p className="text-white/80 text-sm sm:text-base mt-2">
            Post a driving task or track the status of the ones you've already posted.
          </p>
        </div>
      </div>

      {/* ===== Tab bar (overlapping the header) ===== */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 sm:p-2 flex gap-1.5 sm:gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <Icon size={18} />
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8 sm:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'post' && <PostATask />}
            {activeTab === 'myTasks' && <UserTasks />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskManagement;