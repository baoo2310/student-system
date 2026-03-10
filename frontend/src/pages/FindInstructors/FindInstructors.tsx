import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { majorApi } from '../../api/major.api';
import { instructorApi } from '../../api/instructor.api';

export default function FindInstructors() {
    const { currentUser } = useSelector((state: RootState) => state.user);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [majors, setMajors] = useState<any[]>([]);
    const [selectedMajor, setSelectedMajor] = useState<string>('');
    const [search, setSearch] = useState('');
    const [minRate, setMinRate] = useState('');
    const [maxRate, setMaxRate] = useState('');
    const [minRating, setMinRating] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        // Fetch all majors for the dropdown filter
        const fetchMajors = async () => {
            try {
                const data = await majorApi.getMajors();
                if (data.success) {
                    setMajors(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch majors:', err);
                toast.error('Failed to load subjects.');
            }
        };

        fetchMajors();
    }, []);

    const handleApplyFilters = () => {
        const fetchInstructors = async () => {
            setIsLoading(true);
            try {
                const data = await instructorApi.getInstructors({
                    majorId: selectedMajor || undefined,
                    search: search || undefined,
                    minRate: minRate || undefined,
                    maxRate: maxRate || undefined,
                    minRating: minRating || undefined,
                    sortBy
                });

                if (data.success) {
                    setInstructors(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch instructors:', err);
                toast.error('Failed to load instructors.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInstructors();
        setCurrentPage(1);
    };

    useEffect(() => {
        handleApplyFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    if (currentUser?.role === 'INSTRUCTOR') {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
                <h2 className="text-xl font-bold dark:text-white">Instructors cannot browse other instructors.</h2>
                <p className="mt-2 text-gray-500">Only students can find instructors.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find an Instructor</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Browse our active instructors and find the right match for your learning goals.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 w-full mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Name or bio..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                    </div>

                    {/* Major */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                        <select
                            value={selectedMajor}
                            onChange={(e) => setSelectedMajor(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        >
                            <option value="">All Subjects</option>
                            {majors.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Hourly Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate ($)</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minRate}
                                min={0}
                                onChange={(e) => setMinRate(e.target.value)}
                                className="w-1/2 px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxRate}
                                min={0}
                                onChange={(e) => setMaxRate(e.target.value)}
                                className="w-1/2 px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Minimum Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                        <select
                            value={minRating}
                            onChange={(e) => setMinRating(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        >
                            <option value="">Any Rating</option>
                            <option value="4.5">4.5 & up</option>
                            <option value="4.0">4.0 & up</option>
                            <option value="3.5">3.5 & up</option>
                            <option value="3.0">3.0 & up</option>
                        </select>
                    </div>
                </div>

                <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-5 space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Sort By:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border rounded-md text-sm font-medium dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                        >
                            <option value="newest">Newest</option>
                            <option value="rate_asc">Rate (Low to High)</option>
                            <option value="rate_desc">Rate (High to Low)</option>
                            <option value="rating_desc">Highest Rated</option>
                        </select>
                    </div>
                    <button
                        onClick={handleApplyFilters}
                        className="w-full md:w-auto px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center my-20">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : instructors.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-full animate-fade-in">
                    <p className="text-xl text-gray-500 dark:text-gray-400">No instructors found matching your criteria.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in mb-8">
                        {instructors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((instructor) => (
                            <div key={instructor.id} className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 flex flex-col hover:shadow-lg transition-shadow">
                                <div className="flex items-center space-x-4 mb-4">
                                    {instructor.avatarUrl ? (
                                        <img src={instructor.avatarUrl} alt={instructor.username} className="h-16 w-16 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold">
                                            {instructor.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{instructor.username}</h3>
                                        {instructor.profile?.hourlyRate && (
                                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">${instructor.profile.hourlyRate}/hr</p>
                                        )}
                                        {instructor.avgRating !== undefined && instructor.avgRating > 0 && (
                                            <div className="flex items-center text-xs mt-1 font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded-md border border-yellow-200 dark:border-yellow-700/50 w-max">
                                                <svg className="w-3 h-3 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                {instructor.avgRating.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 overflow-hidden flex-grow">
                                    {instructor.profile?.bio || 'No bio provided for this instructor.'}
                                </p>

                                <div className="mb-6 flex flex-wrap gap-2">
                                    {instructor.majors?.slice(0, 3).map((m: any) => (
                                        <span key={m.major.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            {m.major.name}
                                        </span>
                                    ))}
                                    {instructor.majors?.length > 3 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            +{instructor.majors.length - 3} more
                                        </span>
                                    )}
                                </div>

                                <Link
                                    to={`/instructors/${instructor.id}`}
                                    className="w-full mt-auto block text-center py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    View Profile
                                </Link>
                            </div>
                        ))}
                    </div>

                    {instructors.length > ITEMS_PER_PAGE && (
                        <div className="flex justify-center items-center space-x-2 pb-10">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Page {currentPage} of {Math.ceil(instructors.length / ITEMS_PER_PAGE)}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(instructors.length / ITEMS_PER_PAGE), p + 1))}
                                disabled={currentPage === Math.ceil(instructors.length / ITEMS_PER_PAGE)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
