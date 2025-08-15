import React, { useState } from 'react';

const NotificationForm = ({ onSchedule, onSendImmediate, onCancel, loading }) => {
  const [type, setType] = useState('email');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // At least 1 minute from now
    return now.toISOString().slice(0, 16);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      type,
      recipient,
      message,
      scheduledTime
    };

    if (type === 'email') {
      payload.subject = subject;
    }

    const success = await onSchedule(payload);
    if (success) {
      resetForm();
    }
  };

  const handleSendImmediate = async () => {
    const payload = {
      type,
      recipient,
      message
    };

    if (type === 'email') {
      payload.subject = subject;
    }

    const success = await onSendImmediate(payload);
    if (success) {
      resetForm();
    }
  };

  const resetForm = () => {
    setType('email');
    setRecipient('');
    setSubject('');
    setMessage('');
    setScheduledTime('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg max-w-lg w-full mx-4">
        
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>

        <h3 className="text-lg font-bold mb-4">Create Notification</h3>
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <input
              type={type === 'email' ? 'email' : 'tel'}
              placeholder={type === 'email' ? 'recipient@example.com' : '+1234567890'}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {type === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              placeholder="Your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Time (Optional)</label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={getMinDateTime()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately</p>
          </div>

          <div className="flex gap-2">
            {scheduledTime ? (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendImmediate}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Now'}
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationForm;
