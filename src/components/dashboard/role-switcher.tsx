'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type ViewMode = 'member' | 'admin';

interface RoleSwitcherProps {
    currentMode: ViewMode;
    onToggle: (mode: ViewMode) => void;
}

export function RoleSwitcher({ currentMode, onToggle }: RoleSwitcherProps) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 p-1 bg-white/90 backdrop-blur rounded-full border shadow-lg">
            <button
                onClick={() => onToggle('member')}
                className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    currentMode === 'member'
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-100"
                )}
            >
                Member View
            </button>
            <button
                onClick={() => onToggle('admin')}
                className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    currentMode === 'admin'
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-100"
                )}
            >
                Admin View
            </button>
        </div>
    );
}
