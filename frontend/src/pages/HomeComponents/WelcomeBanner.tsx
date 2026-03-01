import type { User } from '@shared/index';

interface WelcomeBannerProps {
    user: User | null;
}

export default function WelcomeBanner({ user }: WelcomeBannerProps) {
    const displayName = user?.username || 'Guest';

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-2xl shadow-lg p-8 text-white mb-8 transition-colors duration-300">
            <h1 className="text-3xl font-bold mb-2">
                Welcome back, {displayName} 👋
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
                Here's what's happening with your courses and match requests today.
            </p>
        </div>
    );
}
