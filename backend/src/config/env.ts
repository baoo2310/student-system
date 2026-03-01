import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT || '3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL as string,
    // JWT
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    // App
    APP_URL: process.env.APP_URL || 'http://localhost:5173',
    // SMTP
    SMTP_HOST: process.env.SMTP_HOST as string,
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '465', 10),
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_PASS: process.env.SMTP_PASS as string,
    SMTP_FROM: process.env.SMTP_FROM as string,
};

// Validate required env vars at startup
const REQUIRED = [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
] as const;
for (const key of REQUIRED) {
    if (!env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
