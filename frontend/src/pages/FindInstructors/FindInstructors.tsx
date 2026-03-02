import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function FindInstructors() {
    const { currentUser, token } = useSelector((state: RootState) => state.user);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [majors, setMajors] = useState<any[]>([]);
    const [selectedMajor, setSelectedMajor] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch all majors for the dropdown filter
        const fetchMajors = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/majors');
                const data = await res.json();
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

    useEffect(() => {
        const fetchInstructors = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('http://localhost:3000/api/instructors', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();

                if (data.success) {
                    // Filter matching selected major on the frontend for now, or update backend to accept queries
                    let filteredInstructors = data.data;

                    if (selectedMajor) {
                        filteredInstructors = filteredInstructors.filter((inst: any) =>
                            inst.majors.some((m: any) => m.major.id === selectedMajor)
                        );
                    }

                    setInstructors(filteredInstructors);
                }
            } catch (err) {
                console.error('Failed to fetch instructors:', err);
                toast.error('Failed to load instructors.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInstructors();
    }, [selectedMajor, token]);


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

                <div className="w-full sm:w-64">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Filter by Subject
                    </label>
                    <select
                        value={selectedMajor}
                        onChange={(e) => setSelectedMajor(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white transition-colors"
                    >
                        <option value="">All Subjects</option>
                        {majors.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {instructors.map((instructor) => (
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
            )}
        </div>
    );
}
