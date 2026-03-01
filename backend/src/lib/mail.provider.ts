import nodemailer from 'nodemailer';
import { env } from '../config/env';

// ─── Transporter ──────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for 465 (SSL), false for 587 (TLS)
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

// ─── Send Verification Email ──────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `${env.APP_URL}/api/auth/verify-email?token=${token}`;

    await transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject: 'Verify your Student System account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Welcome to Student System 👋</h2>
                <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
                <a href="${verifyUrl}"
                   style="display: inline-block; padding: 12px 24px; background-color: #4F46E5;
                          color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Verify Email
                </a>
                <p style="margin-top: 16px; color: #6B7280; font-size: 14px;">
                    Or copy and paste this link into your browser:<br/>
                    <a href="${verifyUrl}">${verifyUrl}</a>
                </p>
                <p style="color: #6B7280; font-size: 13px;">This link will not expire until you manually request a new one.</p>
            </div>
        `,
    });
}
