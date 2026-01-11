"use client";

import { LoginButton } from "@/components/auth/login-button";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center space-y-6 max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                        L
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">期限管理</h1>
                <p className="text-gray-500">
                    チームのタスク期限を一元管理。<br />
                    Microsoftアカウントでログインして始めましょう。
                </p>

                <div className="pt-4 flex justify-center">
                    {/* Pass a prop to login button if needed, or just use it as is */}
                    <LoginButton />
                </div>
            </div>
        </div>
    );
}
