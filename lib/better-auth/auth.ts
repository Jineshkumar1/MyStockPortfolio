import { betterAuth } from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import {connectToDatabase} from "@/database/mongoose";
import {nextCookies} from "better-auth/next-js";


let authInstance: ReturnType<typeof betterAuth> | null = null;


export const getAuth = async () => {
    // Skip database connection during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        // Return a mock auth instance during build
        // This will be replaced with the real instance at runtime
        if (!authInstance) {
            authInstance = betterAuth({
                database: mongodbAdapter(null as any),
                secret: process.env.BETTER_AUTH_SECRET || 'dummy-secret-for-build',
                baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
                emailAndPassword: {
                    enabled: true,
                    disableSignUp: false,
                    requireEmailVerification: false,
                    minPasswordLength: 8,
                    maxPasswordLength: 128,
                    autoSignIn: true,
                },
                plugins: [nextCookies()],
            });
        }
        return authInstance;
    }

    if(authInstance) {
        return authInstance;
    }

    const mongoose = await connectToDatabase();
    const db = mongoose.connection;

    if (!db) {
        throw new Error("MongoDB connection not found!");
    }

    authInstance = betterAuth({
        database: mongodbAdapter(db as any),
       secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
        },
        plugins: [nextCookies()],

    });

    return authInstance;
}

// Only initialize auth if not in build phase
// During build, Next.js will try to analyze this module but won't execute it
// We'll create a lazy getter that initializes on first use
let _auth: Awaited<ReturnType<typeof getAuth>> | null = null;
let _authPromise: Promise<Awaited<ReturnType<typeof getAuth>>> | null = null;

async function getAuthInstance() {
    if (_auth) return _auth;
    if (_authPromise) return _authPromise;
    _authPromise = getAuth();
    _auth = await _authPromise;
    return _auth;
}

// Export auth as a proxy that lazily initializes
export const auth = {
    get api() {
        return {
            getSession: async (options: any) => {
                const instance = await getAuthInstance();
                return instance.api.getSession(options);
            },
            signUpEmail: async (options: any) => {
                const instance = await getAuthInstance();
                return instance.api.signUpEmail(options);
            },
            signInEmail: async (options: any) => {
                const instance = await getAuthInstance();
                return instance.api.signInEmail(options);
            },
            signOut: async (options: any) => {
                const instance = await getAuthInstance();
                return instance.api.signOut(options);
            },
        };
    }
} as Awaited<ReturnType<typeof getAuth>>;