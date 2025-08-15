import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Register = ({ setCurrentView, setEmail: setParentEmail }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const result = await register(email, phone, password);
    if (result.success) {
      setMessage(result.message);
      setParentEmail(result.email);
      setCurrentView('verify');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center">Register</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{message}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="tel"
          placeholder="Phone (e.g., +1234567890)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength="8"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <p className="text-center">
        Already have an account?{' '}
        <button onClick={() => setCurrentView('login')} className="text-blue-600 hover:underline">
          Login
        </button>
      </p>
    </div>
  );
};

export default Register;