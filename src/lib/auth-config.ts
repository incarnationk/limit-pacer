import { Configuration, PopupRequest } from "@azure/msal-browser";

// Use static access for environment variables to ensure Next.js build-time injection works correctly
const getClientId = (): string => {
    // During build/SSR, return empty string to prevent build errors
    if (typeof window === 'undefined') {
        return '';
    }

    const value = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID;

    if (!value || value === 'NOT_CONFIGURED' || value === 'PLACEHOLDER_WILL_BE_REPLACED') {
        console.error(
            `Environment variable NEXT_PUBLIC_AZURE_AD_CLIENT_ID is not set correctly. ` +
            `Current value: ${value}. Authentication will not work.`
        );
        return 'NOT_CONFIGURED';
    }
    return value;
};

// Values from environment variables (required)
export const msalConfig: Configuration = {
    auth: {
        clientId: getClientId(),
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
