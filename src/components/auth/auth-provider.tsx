"use client";

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "@/lib/auth-config";
import { ReactNode } from "react";

const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL instance (handling async initialization if needed)
msalInstance.initialize();

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <MsalProvider instance={msalInstance}>
            {children}
        </MsalProvider>
    );
}
