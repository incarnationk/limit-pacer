import { Configuration, PopupRequest } from "@azure/msal-browser";

// Values from environment variables (or hardcoded for dev convenient if env not set)
export const msalConfig: Configuration = {
    auth: {
        clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || "4657c03a-0244-47b0-84e4-11d4d916cacb",
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
