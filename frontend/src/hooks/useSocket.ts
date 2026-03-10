import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { addNotification } from '../store/notificationSlice';

const SOCKET_URL = 'http://localhost:3000';

let socketInstance: Socket | null = null;

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(socketInstance);
    const { isAuthenticated, currentUser } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        if (isAuthenticated && currentUser && !socketInstance) {
            socketInstance = io(SOCKET_URL, {
                withCredentials: true,
                autoConnect: true,
            });

            setSocket(socketInstance);

            socketInstance.on('connect', () => {
                console.log('Connected to WebSocket');
                // Join personal room for notifications
                socketInstance?.emit('join_user_room', currentUser.id);
            });

            // Listen for global notifications
            socketInstance.on('new_notification', (notification) => {
                dispatch(addNotification(notification));
            });
        }

        return () => {
            // Keep socket alive across navigation, we won't disconnect immediately here. 
            // Proper cleanup depends on logout
        };
    }, [isAuthenticated, currentUser, dispatch]);

    // Handle logout cleanup
    useEffect(() => {
        if (!isAuthenticated && socketInstance) {
            socketInstance.disconnect();
            socketInstance = null;
            setSocket(null);
        }
    }, [isAuthenticated]);

    return socket;
};
