import React, { createContext, useState, useContext, useCallback } from 'react';

// Create a context for notifications
const NotificationContext = createContext({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  hasMockDataNotification: false,
  setUsingMockData: () => {}
});

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success'
};

// Custom hook to use the notification context
export const useNotification = () => useContext(NotificationContext);

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasMockDataNotification, setHasMockDataNotification] = useState(false);

  // Add a new notification
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, timeout = 5000) => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after timeout if timeout > 0
    if (timeout > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }
    
    return id;
  }, []);

  // Remove a notification by ID
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Set whether mock data is being used
  const setUsingMockData = useCallback((isUsingMockData) => {
    // If we're using mock data and don't already have the notification
    if (isUsingMockData && !hasMockDataNotification) {
      const id = addNotification(
        'Using mock data: The backend server is unreachable. Data shown is simulated.',
        NOTIFICATION_TYPES.WARNING,
        0 // Don't auto-remove this notification
      );
      setHasMockDataNotification(true);
    } 
    // If we're not using mock data but have the notification
    else if (!isUsingMockData && hasMockDataNotification) {
      // Remove all mock data notifications
      setNotifications(prev => prev.filter(n => 
        !(n.type === NOTIFICATION_TYPES.WARNING && 
          n.message.includes('Using mock data'))
      ));
      setHasMockDataNotification(false);
    }
  }, [hasMockDataNotification, addNotification]);

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        removeNotification,
        hasMockDataNotification,
        setUsingMockData
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
