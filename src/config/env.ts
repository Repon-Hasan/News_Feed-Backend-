import dotenv from 'dotenv';
import status from 'http-status';
import AppError from '../errorHelpers/AppError';


dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: string;
    ACCESS_TOKEN_SECRET:string;
ACCESS_TOKEN_EXPIRES_IN:string;
REFRESH_TOKEN_SECRET:string
REFRESH_TOKEN_EXPIRES_IN:string;
    DATABASE_URL: string;
    DIRECT_URL: string;

    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;

    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;

    FRONTEND_URL: string;
    BACKEND_URL: string;

    CLOUDINARY: {
        CLOUDINARY_CLOUD_NAME: string;
        CLOUDINARY_API_KEY: string;
        CLOUDINARY_API_SECRET: string;
    };
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariables = [
        'NODE_ENV',
        'PORT',

        'DATABASE_URL',
        'DIRECT_URL',

        'BETTER_AUTH_SECRET',
        'BETTER_AUTH_URL',

        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',

        'FRONTEND_URL',
        'BACKEND_URL',

        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'ACCESS_TOKEN_SECRET',
'ACCESS_TOKEN_EXPIRES_IN',
'REFRESH_TOKEN_SECRET',
'REFRESH_TOKEN_EXPIRES_IN'
    ];

    requiredEnvVariables.forEach((variable) => {
        if (!process.env[variable]?.trim()) {
            throw new AppError(
                status.INTERNAL_SERVER_ERROR,
                `Environment variable ${variable} is required but not set in .env file.`
            );
        }
    });

    return {
        NODE_ENV: process.env.NODE_ENV as string,
        PORT: process.env.PORT as string,

        DATABASE_URL: process.env.DATABASE_URL!.trim(),
        DIRECT_URL: process.env.DIRECT_URL!.trim(),

        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!.trim(),
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!.trim(),

        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!.trim(),
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!.trim(),

        FRONTEND_URL: process.env.FRONTEND_URL!.trim(),
        BACKEND_URL: process.env.BACKEND_URL!.trim(),
        ACCESS_TOKEN_SECRET:process.env.ACCESS_TOKEN_SECRET!,
ACCESS_TOKEN_EXPIRES_IN:process.env.ACCESS_TOKEN_EXPIRES_IN!,
REFRESH_TOKEN_SECRET:process.env.REFRESH_TOKEN_SECRET!,
REFRESH_TOKEN_EXPIRES_IN:process.env.REFRESH_TOKEN_EXPIRES_IN!,

        CLOUDINARY: {
            CLOUDINARY_CLOUD_NAME:
                process.env.CLOUDINARY_CLOUD_NAME!.trim(),

            CLOUDINARY_API_KEY:
                process.env.CLOUDINARY_API_KEY!.trim(),

            CLOUDINARY_API_SECRET:
                process.env.CLOUDINARY_API_SECRET!.trim(),
        },
    };
};

export const envVars = loadEnvVariables();