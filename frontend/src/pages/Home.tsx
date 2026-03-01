import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { UserRole } from '@shared/index';

import WelcomeBanner from './HomeComponents/WelcomeBanner';
import StudentDashboard from './HomeComponents/StudentDashboard/StudentDashboard';
import InstructorDashboard from './HomeComponents/InstructorDashboard/InstructorDashboard';

export default function Home() {
    const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            const timer = setTimeout(() => {
                navigate('/login');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, navigate]);

    // Fallback if user is not loaded yet or not authenticated
    if (!isAuthenticated) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded-r-md">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                You are not logged in. Redirecting to login page in 3 seconds...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const role = currentUser?.role || UserRole.STUDENT; // Defaulting for testing if no role is present

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
            <WelcomeBanner user={currentUser} />

            {role === UserRole.STUDENT && <StudentDashboard />}
            {role === UserRole.INSTRUCTOR && <InstructorDashboard />}
            {role === UserRole.ADMIN && (
                <div className="p-8 bg-purple-50 dark:bg-purple-900/30 rounded-2xl border border-purple-200 dark:border-purple-700">
                    <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100">Admin Controls</h2>
                    <p className="text-purple-700 dark:text-purple-300 mt-2">System administration dashboard coming soon.</p>
                </div>
            )}
        </div>
    );
}
