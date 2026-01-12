"use client";

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "@/lib/auth-config";
import { ReactNode, useEffect } from "react";

const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL instance and handle redirect promise
if (typeof window !== 'undefined') {
    msalInstance.initialize().then(() => {
        // Handle redirect response after login
        msalInstance.handleRedirectPromise().catch((error) => {
            console.error("Redirect error:", error);
        });
    });
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <MsalProvider instance={msalInstance}>
            {children}
        </MsalProvider>
    );
}
