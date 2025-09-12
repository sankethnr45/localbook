// src/components/NotificationHandler.jsx
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const NotificationHandler = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  useEffect(() => {
    // If a user is logged in, establish a socket connection
    if (user && !socketRef.current) {
      // --- START OF FIX ---
      // Use the production URL from env vars, but remove the /api part for the socket connection
      const socketURL = import.meta.env.VITE_API_BASE_URL 
                        ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
                        : 'http://localhost:3001';

      socketRef.current = io(socketURL);
      // --- END OF FIX ---
      
      socketRef.current.emit('joinRoom', user.id);

      // Listen for new bookings
      socketRef.current.on('new-booking', (notification) => {
        console.log('Received new-booking notification:', notification);
        alert(`Notification: ${notification.message}`);
        
        // IMPORTANT: If the user is a provider, refetch their dashboard data
        if (user.role === 'PROVIDER') {
          queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        }
      });
    }

    // Cleanup when the user logs out or component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, queryClient]);

  // This component doesn't render anything visible
  return null;
};

export default NotificationHandler;