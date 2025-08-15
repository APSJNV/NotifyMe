import React from 'react';

const NotificationCard = ({ notification, onCancel }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'sms':
        return 'bg-green-100 text-green-800';
      case 'whatsapp':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(notification.type)}`}>
              {notification.type.toUpperCase()}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(notification.status)}`}>
              {notification.status.toUpperCase()}
            </span>
          </div>
          
          <p className="text-sm font-medium text-gray-900">
            To: {notification.recipient}
          </p>
          
          {notification.subject && (
            <p className="text-sm text-gray-600 mb-1">
              Subject: {notification.subject}
            </p>
          )}
          
          <p className="text-sm text-gray-600 mb-2">
            {notification.message.length > 100 
              ? `${notification.message.substring(0, 100)}...` 
              : notification.message
            }
          </p>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>Scheduled: {new Date(notification.scheduledTime).toLocaleString()}</p>
            {notification.sentAt && (
              <p>Sent: {new Date(notification.sentAt).toLocaleString()}</p>
            )}
            {notification.errorMessage && (
              <p className="text-red-600">Error: {notification.errorMessage}</p>
            )}
          </div>
        </div>
        
        <div className="ml-4">
          {notification.status === 'scheduled' && (
            <button
              onClick={() => onCancel(notification._id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;