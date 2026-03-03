import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { matchApi } from '../../api/match.api';
import toast from 'react-hot-toast';
import { instructorApi } from '../../api/instructor.api';

export default function InstructorDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state: RootState) => state.user);

    const [instructor, setInstructor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [selectedMajor, setSelectedMajor] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchInstructorDetails = async () => {
            setIsLoading(true);
            try {
                const data = await instructorApi.getInstructorById(id!);

                if (data.success) {
                    setInstructor(data.data);
                    // Pre-select the first major if one exists
                    if (data.data.majors?.length > 0) {
                        setSelectedMajor(data.data.majors[0].major.id);
                    }
                } else {
                    toast.error(data.message || 'Instructor not found');
                    navigate('/instructors');
                }
            } catch (err) {
                console.error('Failed to fetch instructor details:', err);
                toast.error('Failed to load instructor details.');
                navigate('/instructors');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchInstructorDetails();
        }
    }, [id, navigate]);

    const handleOpenModal = () => {
        if (currentUser?.role === 'INSTRUCTOR') {
            toast.error('Instructors cannot request matches.');
            return;
        }
        setRequestMessage('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setRequestMessage('');
    };

    const handleSubmitMatchRequest = async () => {
        setIsSubmitting(true);
        try {
            await matchApi.createMatchRequest({
                instructorId: id!,
                majorId: selectedMajor || undefined,
                message: requestMessage.trim() || undefined
            });
            toast.success('Match request sent successfully!');
            handleCloseModal();
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || 'Failed to send match request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center my-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!instructor) {
        return null; // The useEffect navigates away if instructor is not found
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
            {/* Back Button */}
            <button
                onClick={() => navigate('/instructors')}
                className="mb-8 flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
                &larr; Back to Instructors
            </button>

            {/* Profile Overview Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header/Banner (Optional colored background) */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

                <div className="px-6 sm:px-10 pb-10 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-end -mt-16 sm:-mt-12 space-x-6 relative">
                            {/* Avatar */}
                            <div className="rounded-full bg-white dark:bg-gray-800 p-2 shadow-lg">
                                {instructor.avatarUrl ? (
                                    <img src={instructor.avatarUrl} alt={instructor.username} className="h-28 w-28 rounded-full object-cover border border-gray-100 dark:border-gray-600" />
                                ) : (
                                    <div className="h-28 w-28 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-5xl font-bold border border-gray-100 dark:border-gray-600">
                                        {instructor.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Name and Basic Info */}
                            <div className="pb-2">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{instructor.username}</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                    Member since {new Date(instructor.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Booking Details / Actions */}
                        <div className="mt-6 sm:mt-0 flex flex-col items-start sm:items-end">
                            {instructor.profile?.hourlyRate && (
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">
                                    ${instructor.profile.hourlyRate}<span className="text-sm text-gray-500 font-normal">/hr</span>
                                </div>
                            )}
                            <button
                                onClick={handleOpenModal}
                                disabled={currentUser?.role === 'INSTRUCTOR'}
                                className={`px-8 py-3 rounded-lg text-white font-semibold transition-colors shadow-md ${currentUser?.role === 'INSTRUCTOR'
                                    ? 'bg-gray-400 cursor-not-allowed dark:bg-gray-600'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50'
                                    }`}
                            >
                                Request Match
                            </button>
                        </div>
                    </div>

                    {/* Instructor Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Main Content: Bio */}
                        <div className="md:col-span-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About Me</h2>
                            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                                {instructor.profile?.bio ? (
                                    <p className="whitespace-pre-line">{instructor.profile.bio}</p>
                                ) : (
                                    <p className="italic text-gray-400">This instructor hasn't provided a bio yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Sidebar: Subjects & Meta */}
                        <div>
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Subjects I Teach</h2>
                                {instructor.majors?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {instructor.majors.map((m: any) => (
                                            <span
                                                key={m.major.id}
                                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50"
                                            >
                                                {m.major.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No subjects listed.</p>
                                )}
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                                    <a href={`mailto:${instructor.email}`} className="text-blue-600 hover:underline dark:text-blue-400">
                                        {instructor.email}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Requesting Match */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseModal}
                        aria-hidden="true"
                    />

                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-in border border-gray-200 dark:border-gray-700">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Request a Match</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Let {instructor.username} know what you need help with. They will review your request and get back to you.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Subject
                                </label>
                                {instructor.majors?.length > 0 ? (
                                    <select
                                        value={selectedMajor}
                                        onChange={(e) => setSelectedMajor(e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg dark:bg-gray-700 dark:text-white transition-colors"
                                    >
                                        {instructor.majors.map((m: any) => (
                                            <option key={m.major.id} value={m.major.id}>{m.major.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-sm text-red-500 italic">Instructor has no subjects listed.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Message (Optional)
                                </label>
                                <textarea
                                    rows={4}
                                    value={requestMessage}
                                    onChange={(e) => setRequestMessage(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-colors"
                                    placeholder="Hi! I am struggling with Data Structures and noticed it is your specialty. Are you available for tutoring on Tuesdays?"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-semibold rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:text-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitMatchRequest}
                                disabled={isSubmitting || (instructor.majors?.length > 0 && !selectedMajor)}
                                className={`px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm ${(isSubmitting || (instructor.majors?.length > 0 && !selectedMajor))
                                    ? 'opacity-70 cursor-not-allowed'
                                    : ''
                                    }`}
                            >
                                {isSubmitting ? 'Sending Request...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
