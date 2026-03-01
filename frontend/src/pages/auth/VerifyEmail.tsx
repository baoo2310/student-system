import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                await authApi.verifyEmail(token);
                setStatus('success');
            } catch (err: any) {
                setStatus('error');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-center">

                {status === 'loading' && (
                    <div className="fade-in text-gray-700 dark:text-gray-300">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p>Verifying your email address...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="fade-in">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Email Verified!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Your account has been verified successfully. You can now log in to the Student System.
                        </p>
                        <Link
                            to="/auth/login"
                            className="w-full inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Login to your account
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="fade-in">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Verification Failed
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            The verification token is invalid or has expired. Please try registering again or contact support.
                        </p>
                        <Link
                            to="/auth/register"
                            className="w-full inline-flex justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Back to Registration
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}
