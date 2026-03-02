import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function Setting() {
    return (
        <div className="relative">
            <Link
                to="/settings"
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Settings"
            >
                <Cog6ToothIcon className="h-6 w-6" aria-hidden="true" />
            </Link>
        </div>
    );
}