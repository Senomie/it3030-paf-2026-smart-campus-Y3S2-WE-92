import React, { createContext, useState, useCallback } from 'react';
import ToastContainer from '../components/Toast';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'success', duration = 4500) => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev, { id, message, type }]);
        
        // Auto-dismiss after specified duration
        const timer = setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);

        // Return function to manually dismiss
        return () => {
            clearTimeout(timer);
            removeNotification(id);
        };
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Helper methods for common cases
    const success = useCallback((msg, duration) => showNotification(msg, 'success', duration), [showNotification]);
    const error = useCallback((msg, duration) => showNotification(msg, 'error', duration || 6000), [showNotification]);
    const warning = useCallback((msg, duration) => showNotification(msg, 'warning', duration), [showNotification]);
    const info = useCallback((msg, duration) => showNotification(msg, 'info', duration), [showNotification]);

    return (
        <NotificationContext.Provider value={{ 
            showNotification, 
            removeNotification, 
            notifications,
            success,
            error,
            warning,
            info
        }}>
            {children}
            <ToastContainer />
        </NotificationContext.Provider>
    );
};
