import React from 'react';
import { useNotification, NOTIFICATION_TYPES } from '../contexts/NotificationContext';

const NotificationBanner = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  // Map notification types to Tailwind classes
  const getNotificationClass = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.WARNING:
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case NOTIFICATION_TYPES.ERROR:
        return 'bg-red-100 border-red-400 text-red-800';
      case NOTIFICATION_TYPES.SUCCESS:
        return 'bg-green-100 border-green-400 text-green-800';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'bg-blue-100 border-blue-400 text-blue-800';
    }
  };

  // Map notification types to icons
  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.WARNING:
        return '⚠️';
      case NOTIFICATION_TYPES.ERROR:
        return '❌';
      case NOTIFICATION_TYPES.SUCCESS:
        return '✅';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-2 space-y-2 shadow-lg">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center p-4 border-l-4 rounded shadow-md ${getNotificationClass(notification.type)}`}
        >
          <div className="mr-3">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-grow">{notification.message}</div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;
