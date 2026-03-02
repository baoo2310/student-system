import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaUserCircle, FaShieldAlt } from 'react-icons/fa';
import type { RootState } from '../../store/store';
import GeneralTab from './GeneralTab';
import SecurityTab from './SecurityTab';

export default function Profile() {
    const { currentUser } = useSelector((state: RootState) => state.user);

    // UI state
    const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');

    if (!currentUser) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6 dark:text-white">Profile Settings</h1>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'general'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        <FaUserCircle className={`mr-2 h-5 w-5 ${activeTab === 'general' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        General Information
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'security'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        <FaShieldAlt className={`mr-2 h-5 w-5 ${activeTab === 'security' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        Security
                    </button>
                </nav>
            </div>

            {/* Tab Contents */}
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'security' && <SecurityTab />}
        </div>
    );
}
