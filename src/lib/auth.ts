import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";


import { envVars } from "../config/env";
import { prisma } from "./prisma";
import { Role } from "../generated/prisma/enums";

export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,

    secret: envVars.BETTER_AUTH_SECRET,

    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    // =========================
    // Email + Password
    // =========================
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },

    // =========================
    // Google Login
    // =========================
    socialProviders: {
        google: {
            clientId: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,

            mapProfileToUser: () => {
                return {
                    role: Role.USER,
                };
            },
        },
    },

    // =========================
    // User Custom Fields
    // =========================
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.USER,
                input: false,
            },
        },
    },

    // =========================
    // Session
    // =========================
    // No custom expiration time.
    // Better Auth will use its default session settings.
    
    // =========================
    // Plugins
    // =========================
    plugins: [
        bearer(),
    ],

    // =========================
    // Trusted Origins
    // =========================
    trustedOrigins: [
        envVars.BETTER_AUTH_URL,
        envVars.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5000",
    ],

    // =========================
    // Cookie Configuration
    // =========================
    advanced: {
        useSecureCookies: envVars.NODE_ENV === "production",

        cookies: {
            state: {
                attributes: {
                    sameSite:
                        envVars.NODE_ENV === "production"
                            ? "none"
                            : "lax",
                    secure: envVars.NODE_ENV === "production",
                    httpOnly: true,
                    path: "/",
                },
            },

            sessionToken: {
                attributes: {
                    sameSite:
                        envVars.NODE_ENV === "production"
                            ? "none"
                            : "lax",
                    secure: envVars.NODE_ENV === "production",
                    httpOnly: true,
                    path: "/",
                },
            },
        },
    },
});