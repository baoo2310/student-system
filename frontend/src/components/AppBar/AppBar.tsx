import { Link } from 'react-router-dom';
import ModeSelector from './ModeSelector';
import ProfileMenu from './ProfileMenu';
import NotificationBell from './NotificationBell';
import { useSelector } from 'react-redux';
import type { RootState } from 'src/store/store';
import { UserRole } from '@shared/index';
import Setting from './Setting';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function AppBar() {
    const { currentUser } = useSelector((state: RootState) => state.user);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo / Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/home" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            Student System
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
                        <Link to="/courses" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            Courses
                        </Link>

                        {currentUser?.role === UserRole.INSTRUCTOR && (
                            <Link to="/my-courses" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                                My Courses
                            </Link>
                        )}

                        {currentUser?.role === UserRole.STUDENT && (
                            <Link to="/instructors" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                                Find Instructors
                            </Link>
                        )}
                        <Link to="/matches" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            My Matches
                        </Link>
                        <Link to="/chat" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            Messages
                        </Link>
                        <Link to="/schedule" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            Schedule
                        </Link>
                        <Link to="/analytics" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            Analytics
                        </Link>

                        {currentUser?.role === UserRole.ADMIN && (
                            <Link to="/admin" className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                                Admin Panel
                            </Link>
                        )}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-4 ml-auto">

                        <ModeSelector />
                        <NotificationBell />
                        <Setting />
                        <ProfileMenu />

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center ml-2">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMobileMenuOpen ? (
                                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                ) : (
                                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state. */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/courses" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white">
                            Courses
                        </Link>
                        {currentUser?.role === UserRole.INSTRUCTOR && (
                            <Link to="/my-courses" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white">
                                My Courses
                            </Link>
                        )}
                        {currentUser?.role === UserRole.STUDENT && (
                            <Link to="/instructors" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white">
                                Find Instructors
                            </Link>
                        )}
                        <Link to="/matches" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white">
                            My Matches
                        </Link>
                        <Link to="/chat" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white">
                            Messages
                        </Link>
                        <Link to="/schedule" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white">
                            Schedule
                        </Link>
                        <Link to="/analytics" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white">
                            Analytics
                        </Link>
                        {currentUser?.role === UserRole.ADMIN && (
                            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10">
                                Admin Panel
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
