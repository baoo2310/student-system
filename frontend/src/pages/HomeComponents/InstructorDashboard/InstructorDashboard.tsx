export default function InstructorDashboard() {
    return (
        <div className="space-y-6">

            {/* Teaching Overview */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Teaching Overview</h2>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        + Create New Course
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Mock Teaching Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Advanced React Patterns</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Software Engineering</p>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">$120</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Incoming Match Requests */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Incoming Student Requests</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">

                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Jane Smith</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Requesting mentoring for Advanced React</p>
                        </div>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-md transition-colors">
                                Accept
                            </button>
                            <button className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-md transition-colors">
                                Decline
                            </button>
                        </div>
                    </div>

                </div>
            </section>

        </div>
    );
}
