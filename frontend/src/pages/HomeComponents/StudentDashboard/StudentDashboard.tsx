export default function StudentDashboard() {
    return (
        <div className="space-y-6">

            {/* Active Courses Section */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Active Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Mock Course Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
                                Active
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Comp Sci</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Introduction to Algorithms</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                            Master the fundamentals of algorithmic design and analysis.
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Instructor:</span>&nbsp;Dr. Ada Lovelace
                        </div>
                    </div>
                </div>
            </section>

            {/* Pending Requests Section */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Pending Match Requests</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Alan Turing</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Mathematics Tutoring</p>
                        </div>
                        <span className="inline-flex items-center rounded-md bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-500 ring-1 ring-inset ring-yellow-600/20">
                            Pending
                        </span>
                    </div>
                </div>
            </section>

        </div>
    );
}
