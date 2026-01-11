import { Configuration, PopupRequest } from "@azure/msal-browser";

// Validate required environment variables at runtime (not at build time)
const getRequiredEnvVar = (name: string): string => {
    // Only validate in browser context (not during SSR/build)
    if (typeof window === 'undefined') {
        // During build/SSR, return empty string to prevent build errors
        return '';
    }

    const value = process.env[name];
    if (!value) {
        throw new Error(
            `Required environment variable ${name} is not set. ` +
            `Please configure it in your .env.local file or Azure Static Web Apps configuration.`
        );
    }
    return value;
};

// Values from environment variables (required)
export const msalConfig: Configuration = {
    auth: {
        clientId: getRequiredEnvVar("NEXT_PUBLIC_AZURE_AD_CLIENT_ID"),
        // authority: "https://login.microsoftonline.com/common", // Use 'common' for Multi-tenant + Personal
        authority: "https://login.microsoftonline.com/common",
        // Dynamically set redirectUri to current origin (works for localhost and deployed URL)
        redirectUri: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
    scopes: ["User.Read", "Files.ReadWrite"]
};
