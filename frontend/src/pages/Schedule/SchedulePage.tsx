import { useState, useEffect } from 'react';
import { scheduleApi, type ScheduleEvent } from '../../api/schedule.api';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 AM to 10:00 PM

export default function SchedulePage() {
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const data = await scheduleApi.getMySchedule();
                if (data.success) {
                    setEvents(data.data);
                }
            } catch (err) {
                console.error('Failed to load schedule', err);
                toast.error('Failed to load schedule');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    // Helper functions for positioning blocks
    const getTopPosition = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const startHour = 8; // Our calendar starts at 8 AM
        const totalMinutes = (hours - startHour) * 60 + minutes;
        // Each hour is 3.5rem (56px) tall
        return (totalMinutes / 60) * 56;
    };

    const getHeight = (startTime: string, endTime: string) => {
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
        return (durationMinutes / 60) * 56;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Schedule</h1>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-x-auto print:shadow-none print:border-none">
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
                        {/* Time labels background grid */}
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

                            {/* 7 columns for the 7 days */}
                            {DAYS_OF_WEEK.map((day) => (
                                <div key={day} className="col-span-1 border-r border-gray-100 dark:border-gray-700 relative">
                                    {/* Horizontal grid lines */}
                                    {TIME_SLOTS.map((hour) => (
                                        <div key={hour} className="h-14 border-b border-gray-100 dark:border-gray-700/50"></div>
                                    ))}

                                    {/* Event blocks for this specific day */}
                                    {events
                                        .filter(e => e.dayOfWeek === day)
                                        .map(event => {
                                            const top = getTopPosition(event.startTime);
                                            const height = getHeight(event.startTime, event.endTime);

                                            return (
                                                <div
                                                    key={event.id}
                                                    className="absolute left-1 right-1 rounded-md p-2 shadow-sm text-xs md:text-sm overflow-hidden border transition-transform hover:scale-[1.02] cursor-pointer
                                                               bg-brand-blue/10 border-brand-blue/30 text-brand-blue dark:bg-brand-blue/20 dark:border-brand-blue/40"
                                                    style={{
                                                        top: `${top}px`,
                                                        height: `${height}px`,
                                                        zIndex: 5
                                                    }}
                                                >
                                                    <p className="font-bold truncate" title={event.courseDetails?.title}>
                                                        {event.courseDetails?.title}
                                                    </p>
                                                    <p className="text-[10px] sm:text-xs opacity-80 mt-1 font-medium">
                                                        {event.startTime} - {event.endTime}
                                                    </p>
                                                </div>
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
                    <p className="text-gray-500 dark:text-gray-400">Your schedule is currently empty. To see events here, you must be enrolled in a course or be an instructor for a running course.</p>
                </div>
            )}
        </div>
    );
}
