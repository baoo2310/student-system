import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { scheduleApi, type ScheduleEvent } from '../../api/schedule.api';
import toast from 'react-hot-toast';
import {
    ClockIcon,
    VideoCameraIcon,
    XMarkIcon,
    CalendarDaysIcon,
    BookOpenIcon,
} from '@heroicons/react/24/outline';

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_FULL: Record<string, string> = {
    MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday',
    THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday',
};
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM – 10 PM

// ─── Schedule Detail Modal ────────────────────────────────────────────────────
function ScheduleModal({ event, onClose }: { event: ScheduleEvent; onClose: () => void }) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                        <CalendarDaysIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                            {event.courseDetails?.title ?? 'Class Session'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {DAY_FULL[event.dayOfWeek] ?? event.dayOfWeek}
                        </p>
                    </div>
                </div>

                {/* Properties */}
                <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>
                            <span className="font-semibold">{event.startTime}</span>
                            {' '}–{' '}
                            <span className="font-semibold">{event.endTime}</span>
                        </span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <CalendarDaysIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>
                            Recurs every{' '}
                            <span className="font-semibold">{DAY_FULL[event.dayOfWeek] ?? event.dayOfWeek}</span>
                        </span>
                    </li>
                    {event.courseDetails?.id && (
                        <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <BookOpenIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <Link
                                to={`/courses/${event.courseDetails.id}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                onClick={onClose}
                            >
                                View course page →
                            </Link>
                        </li>
                    )}
                </ul>

                {/* Meeting Link */}
                {event.meetingLink ? (
                    <a
                        href={event.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        <VideoCameraIcon className="w-5 h-5" />
                        Join Meeting
                    </a>
                ) : (
                    <div className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-medium rounded-xl text-sm">
                        No meeting link set
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SchedulePage() {
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const data = await scheduleApi.getMySchedule();
                if (data.success) setEvents(data.data);
            } catch (err) {
                console.error('Failed to load schedule', err);
                toast.error('Failed to load schedule');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    const getTopPosition = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const totalMinutes = (hours - 8) * 60 + minutes;
        return (totalMinutes / 60) * 56; // 56px per hour
    };

    const getHeight = (startTime: string, endTime: string) => {
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
        return (durationMinutes / 60) * 56;
    };

    const handleClose = useCallback(() => setSelectedEvent(null), []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Schedule</h1>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Header: Days of the Week */}
                        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10">
                            <div className="py-3 px-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Time
                            </div>
                            {DAYS_OF_WEEK.map((day) => (
                                <div key={day} className="py-3 px-4 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider border-l border-gray-100 dark:border-gray-700">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Body: Time slots and Events */}
                        <div className="relative">
                            <div className="grid grid-cols-8">
                                {/* Time labels column */}
                                <div className="col-span-1 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                                    {TIME_SLOTS.map((hour) => (
                                        <div key={hour} className="h-14 flex items-start justify-center pt-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* 7 day columns */}
                                {DAYS_OF_WEEK.map((day) => (
                                    <div key={day} className="col-span-1 border-r border-gray-100 dark:border-gray-700 relative">
                                        {/* Horizontal grid lines */}
                                        {TIME_SLOTS.map((hour) => (
                                            <div key={hour} className="h-14 border-b border-gray-100 dark:border-gray-700/50"></div>
                                        ))}

                                        {/* Event blocks */}
                                        {events
                                            .filter(e => e.dayOfWeek === day)
                                            .map(event => {
                                                const top = getTopPosition(event.startTime);
                                                const height = getHeight(event.startTime, event.endTime);
                                                return (
                                                    <button
                                                        key={event.id}
                                                        onClick={() => setSelectedEvent(event)}
                                                        title={`${event.courseDetails?.title} — click for details`}
                                                        className="absolute left-1 right-1 rounded-md p-2 shadow-sm text-xs md:text-sm overflow-hidden border
                                                                   bg-blue-50 border-blue-200 text-blue-700
                                                                   dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-300
                                                                   transition-all hover:scale-[1.02] hover:shadow-md hover:z-10
                                                                   focus:outline-none focus:ring-2 focus:ring-blue-500
                                                                   cursor-pointer text-left"
                                                        style={{ top: `${top}px`, height: `${height}px`, zIndex: 5 }}
                                                    >
                                                        <p className="font-bold truncate leading-tight">
                                                            {event.courseDetails?.title}
                                                        </p>
                                                        <p className="text-[10px] sm:text-xs opacity-75 mt-0.5 font-medium">
                                                            {event.startTime} – {event.endTime}
                                                        </p>
                                                        {event.meetingLink && (
                                                            <VideoCameraIcon className="w-3 h-3 mt-1 opacity-60" />
                                                        )}
                                                    </button>
                                                );
                                            })
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {events.length === 0 && !isLoading && (
                    <div className="mt-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">
                            Your schedule is currently empty. Enroll in a course or add schedules to your courses to see them here.
                        </p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedEvent && (
                <ScheduleModal event={selectedEvent} onClose={handleClose} />
            )}
        </>
    );
}
