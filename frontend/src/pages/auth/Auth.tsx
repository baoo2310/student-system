import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

export default function AuthLayout() {
    const { isAuthenticated } = useSelector((state: RootState) => state.user);

    // If already logged in, no need to see auth pages
    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <Outlet />
            </div>
        </div>
    );
}
