import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Mock NotificationForm Component
const NotificationForm = ({ onSchedule, onSendImmediate, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    type: 'email',
    recipient: '',
    subject: '',
    message: '',
    scheduledTime: ''
  });

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    if (action === 'schedule') {
      await onSchedule(formData);
    } else {
      const { scheduledTime, ...immediateData } = formData;
      await onSendImmediate(immediateData);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">Create Notification</h3>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient
          </label>
          <input
            type={formData.type === 'email' ? 'email' : 'tel'}
            value={formData.recipient}
            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder={formData.type === 'email' ? 'email@example.com' : '+1234567890'}
            required
          />
        </div>

        {formData.type === 'email' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule Time (optional)
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledTime}
            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'immediate')}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Send Now
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'schedule')}
            disabled={loading || !formData.scheduledTime}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Schedule
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Mock NotificationCard Component
const NotificationCard = ({ notification, onCancel }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const colors = {
      scheduled: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-900 uppercase">
              {notification.type}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(notification.status)}`}>
              {notification.status}
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">To:</span> {notification.recipient}</p>
            {notification.subject && (
              <p><span className="font-medium">Subject:</span> {notification.subject}</p>
            )}
            <p><span className="font-medium">Message:</span> {notification.message}</p>
            {notification.scheduledTime && (
              <p><span className="font-medium">Scheduled:</span> {formatDate(notification.scheduledTime)}</p>
            )}
            {notification.sentAt && (
              <p><span className="font-medium">Sent:</span> {formatDate(notification.sentAt)}</p>
            )}
            <p><span className="font-medium">Created:</span> {formatDate(notification.createdAt)}</p>
          </div>
        </div>
        
        {(notification.status === 'scheduled' || notification.status === 'pending') && (
          <button
            onClick={onCancel}
            className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// Main Component
const NotificationsManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Configure axios defaults
  useEffect(() => {
    // Set base URL to your backend server running on port 5000
   axios.defaults.baseURL = process.env.REACT_APP_API_URL;

    
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/msgs/notifications'); 
      setNotifications(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch notifications');
    }
    setLoading(false);
  };

  const handleScheduleNotification = async (notificationData) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await axios.post('/msgs/notifications', notificationData);
      setSuccessMessage(res.data?.message || 'Notification scheduled');
      setShowForm(false);
      fetchNotifications();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule notification');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSendImmediate = async (notificationData) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await axios.post('/msgs/send-immediate', notificationData);
      setSuccessMessage(res.data?.message || 'Notification sent');
      setShowForm(false);
      fetchNotifications();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send notification');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteNotification = (id) => {
    setConfirmDeleteId(id);
  };

  const handleCancelNotification = async () => {
    if (!confirmDeleteId) return;
    setLoading(true);
    try {
      const res = await axios.delete(`/msgs/notifications/${confirmDeleteId}`);
      setSuccessMessage(res.data?.message || 'Notification canceled');
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel notification');
    } finally {
      setLoading(false);
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Notification
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {showForm && (
        <NotificationForm
          onSchedule={handleScheduleNotification}
          onSendImmediate={handleSendImmediate}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}

      {loading && <div className="text-center py-4">Loading...</div>}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Notification History</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onCancel={() => confirmDeleteNotification(notification._id)}
            />
          ))}
        </div>
      </div>

      {notifications.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          No notifications yet. Create your first notification!
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h4 className="text-lg font-semibold mb-3">Confirm Delete</h4>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this notification?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelNotification}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManager;