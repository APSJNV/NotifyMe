
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Verify = ({ setCurrentView, email }) => {
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { verify, resendCodes } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const result = await verify(email, emailCode, phoneCode);
    if (result.success) {
      setMessage(result.message);
      // User will be automatically logged in and redirected by useEffect in HomePage
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleResendCodes = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const result = await resendCodes(email);
    if (result.success) {
      setMessage(result.message);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center">Verify Account</h2>
      <p className="text-center text-gray-600">Enter the verification codes sent to your email and phone</p>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{message}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Email verification code"
          value={emailCode}
          onChange={(e) => setEmailCode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Phone verification code"
          value={phoneCode}
          onChange={(e) => setPhoneCode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      
      <button
        onClick={handleResendCodes}
        disabled={loading}
        className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
      >
        {loading ? 'Resending...' : 'Resend Codes'}
      </button>
      
      <p className="text-center">
        <button onClick={() => setCurrentView('login')} className="text-blue-600 hover:underline">
          Back to Login
        </button>
      </p>
    </div>
  );
};
export default Verify;