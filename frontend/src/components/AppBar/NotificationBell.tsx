import { useState, useRef, useEffect } from 'react';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../../store/notificationSlice';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch<AppDispatch>();

    const { notifications, unreadCount, isLoading } = useSelector((state: RootState) => state.notification);
    const { isAuthenticated } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchNotifications());
        }
    }, [dispatch, isAuthenticated]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(markNotificationAsRead(id));
    };

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(markAllNotificationsAsRead());
    };

    const getNotificationLink = (type: string) => {
        switch (type) {
            case 'COURSE_ENROLLMENT':
                return '/courses';
            case 'MATCH_REQUEST':
            case 'MATCH_ACCEPTED':
                return '/matches';
            case 'COURSE_REVIEW':
                return '/courses';
            case 'NEW_MESSAGE':
                return '/chat';
            default:
                return '#';
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {isLoading && notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {notifications.map((notif) => (
                                    <Link
                                        key={notif.id}
                                        to={getNotificationLink(notif.type)}
                                        onClick={() => setIsOpen(false)}
                                        className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-800 dark:text-gray-200'}`}>
                                                    {notif.title}
                                                </p>
                                                {notif.body && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                        {notif.body}
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {!notif.isRead && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                    className="shrink-0 p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <CheckIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
