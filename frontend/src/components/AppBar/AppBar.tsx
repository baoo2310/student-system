import { Link } from 'react-router-dom';
import ModeSelector from './ModeSelector';
import ProfileMenu from './ProfileMenu';
import NotificationBell from './NotificationBell';

export default function AppBar() {
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
                        <Link to="/instructors" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            Find Instructors
                        </Link>
                        <Link to="/matches" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            My Matches
                        </Link>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-4 ml-auto">

                        <ModeSelector />
                        <NotificationBell />
                        <ProfileMenu />

                    </div>
                </div>
            </div>
        </nav>
    );
}
