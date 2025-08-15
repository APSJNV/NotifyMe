import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './components/HomePage';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Single HomePage handles all states including authentication */}
        <Route path="/" element={<HomePage />} />
        
        {/* Redirect all other routes to home since HomePage handles everything */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;