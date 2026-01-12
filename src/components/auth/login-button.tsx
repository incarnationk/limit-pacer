"use client";

import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "@/lib/auth-config";
import { LogIn, LogOut, User } from "lucide-react";

import { useRouter } from "next/navigation";

interface LoginButtonProps {
    displayName?: string;
}

export function LoginButton({ displayName }: LoginButtonProps) {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const router = useRouter();

    const handleLogin = async () => {
        try {
            // Use redirect instead of popup for better compatibility with Azure Static Web Apps
            await instance.loginRedirect(loginRequest);
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogout = () => {
        // Client-side logout only: Clear session storage to remove MSAL tokens directly
        // This avoids the 'removeAccount' error and effectively logs out of the app locally
        if (typeof window !== 'undefined') {
            sessionStorage.clear();
            // Force full reload/redirect to clear memory state
            window.location.href = "/login";
        }
    };

    if (isAuthenticated) {
        const name = displayName || accounts[0]?.name || "User";
        return (
            <div className="flex items-center gap-3 bg-white/50 px-4 py-1.5 rounded-full border border-gray-200">
                <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-600" />
                    <span className="text-sm font-semibold text-gray-800">{name}</span>
                </div>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <button
                    onClick={handleLogout}
                    className="text-xs font-medium text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                    <LogOut size={14} />
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
            <LogIn size={16} />
            Sign In
        </button>
    );
}
