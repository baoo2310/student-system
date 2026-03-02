import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../../store/courseSlice';
import type { AppDispatch } from '../../store/store';
import {
    PlusCircleIcon,
    ArrowLeftIcon,
    CurrencyDollarIcon,
    BookOpenIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function CreateCourse() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [majorId, setMajorId] = useState('');
    const [majors, setMajors] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchMajors = async () => {
            try {
                const res = await api.get('/majors');
                if (res.data.success) {
                    setMajors(res.data.data);
                }
            } catch (err) {
                console.error('Failed to load majors', err);
                toast.error('Failed to load subjects options');
            }
        };
        fetchMajors();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !price || isNaN(Number(price))) {
            toast.error('Please provide a valid title and numeric price.');
            return;
        }

        setIsSubmitting(true);
        try {
            await dispatch(createCourse({
                title,
                description,
                price: Number(price),
                majorId: majorId || undefined
            })).unwrap();

            toast.success('Course created successfully!');
            // In a full implementation, we might navigate to the edit page to add schedules
            // For now, we'll just redirect to My Courses
            navigate('/my-courses');
        } catch (err: any) {
            toast.error(err.message || 'Failed to create course');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
            <button
                onClick={() => navigate('/my-courses')}
                className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to My Courses
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-8 py-6 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-100 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <PlusCircleIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                        Create New Course
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Fill in the details below to publish a new course to the catalog.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Course Title *
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <BookOpenIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="title"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm transition-shadow"
                                    placeholder="e.g., Advanced Calculus 101"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="major" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Subject / Major
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <TagIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    id="major"
                                    value={majorId}
                                    onChange={(e) => setMajorId(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                                >
                                    <option value="">Select a Subject (Optional)</option>
                                    {majors.map((m) => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="price" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Price (USD) *
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    id="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm transition-shadow"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Course Description
                            </label>
                            <textarea
                                id="description"
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="block w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm transition-shadow resize-y"
                                placeholder="Describe what students will learn in this course..."
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="bg-white dark:bg-gray-800 py-3 px-6 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-4 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-indigo-500/30 hover:shadow-indigo-500/50"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                'Create Course'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
