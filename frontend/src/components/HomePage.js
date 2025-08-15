import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NotesManager from './notes/NotesManager';
import NotificationsManager from './notifications/NotificationsManager';
import Login from './auth/Login';
import Register from './auth/Register';
import Verify from './auth/Verify';
import { 
  Bell, 
  MessageSquare, 
  Mail, 
  Clock, 
  Star, 
  Calendar,
  Zap,
  Shield,
  Users,
  ArrowRight,
  StickyNote
} from 'lucide-react';

const HomePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'register', 'verify'
  const [email, setEmail] = useState('');

  // Effect to handle authentication state changes
  useEffect(() => {
    if (user) {
      // User is authenticated, switch to home/dashboard view
      setCurrentView('home');
      setActiveTab('home');
    } else {
      // User is not authenticated, make sure we're showing the landing page
      if (currentView !== 'login' && currentView !== 'register' && currentView !== 'verify') {
        setCurrentView('home');
      }
    }
  }, [user]);

  const handleGetStarted = () => {
    if (user) {
      setActiveTab('notes');
    } else {
      setCurrentView('register');
    }
  };

  // Auth content components
  const AuthContent = () => {
    if (currentView === 'login') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="w-full max-w-md">
            <Login setCurrentView={setCurrentView} setEmail={setEmail} />
          </div>
        </div>
      );
    }
    
    if (currentView === 'register') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="w-full max-w-md">
            <Register setCurrentView={setCurrentView} setEmail={setEmail} />
          </div>
        </div>
      );
    }
    
    if (currentView === 'verify') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="w-full max-w-md">
            <Verify setCurrentView={setCurrentView} email={email} />
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Landing page content for non-authenticated users
  const LandingContent = () => (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center items-center mb-8">
              <Bell className="text-yellow-300 animate-pulse mr-4" size={64} />
              <h1 className="text-6xl font-bold tracking-tight">NotifyMe</h1>
            </div>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Never miss what matters. Schedule smart notifications, manage notes, and stay organized 
              with our powerful all-in-one productivity platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleGetStarted}
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-yellow-300 transform hover:scale-105 transition duration-300 shadow-lg"
              >
                Get Started Free
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-gray-900 transition duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <MessageSquare className="text-yellow-300 opacity-70" size={32} />
        </div>
        <div className="absolute top-32 right-20 animate-pulse">
          <Mail className="text-pink-300 opacity-70" size={28} />
        </div>
        <div className="absolute bottom-20 left-1/4 animate-bounce delay-300">
          <Clock className="text-blue-300 opacity-70" size={36} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to keep you on top of your tasks and communications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Features */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="bg-blue-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Bell className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Notifications</h3>
              <p className="text-gray-600 leading-relaxed">
                Schedule email, SMS, and WhatsApp notifications with precision timing. Never forget important reminders again.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="bg-purple-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <StickyNote className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Note Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Create, organize, and manage your notes with a clean, intuitive interface. Keep all your thoughts in one place.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="bg-pink-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Zap className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Send notifications immediately or schedule them for the perfect moment. Lightning-fast delivery guaranteed.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="bg-green-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Reliable</h3>
              <p className="text-gray-600 leading-relaxed">
                Your data is protected with enterprise-grade security. Reliable delivery with comprehensive tracking.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="bg-yellow-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Flexible Scheduling</h3>
              <p className="text-gray-600 leading-relaxed">
                Schedule notifications for any date and time. Perfect for reminders, appointments, and important deadlines.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="bg-indigo-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Multi-Channel</h3>
              <p className="text-gray-600 leading-relaxed">
                Reach anyone through email, SMS, or WhatsApp. Choose the best channel for each message.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to get started</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create Your Content</h3>
              <p className="text-gray-600">Write your message or note with our intuitive editor</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Set Your Schedule</h3>
              <p className="text-gray-600">Choose when and how you want to be notified</p>
            </div>

            <div className="text-center">
              <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Stay Organized</h3>
              <p className="text-gray-600">Receive timely notifications and manage everything in one place</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  // Dashboard content for authenticated users
  const DashboardContent = () => (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
          {activeTab !== 'home' && (
            <div className="mb-6">
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <button 
                  onClick={() => setActiveTab('home')}
                  className="hover:text-gray-700 transition duration-200"
                >
                  Dashboard
                </button>
                <ArrowRight size={16} />
                <span className="text-gray-900 font-medium capitalize">{activeTab}</span>
              </nav>
            </div>
          )}

          {activeTab === 'home' && (
            <div className="text-center py-12">
              <Bell className="text-blue-500 mx-auto mb-6" size={64} />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to your Dashboard
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Manage your notifications and notes all in one place. Get started by creating your first note or setting up a notification.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-lg mx-auto">
                <button 
                  onClick={() => setActiveTab('notes')}
                  className="bg-purple-600 text-white px-6 py-4 rounded-xl hover:bg-purple-700 transition duration-200 flex items-center justify-center gap-3"
                >
                  <StickyNote size={20} />
                  Manage Notes
                </button>
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className="bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-3"
                >
                  <Bell size={20} />
                  Create Notification
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notes' && <NotesManager />}
          {activeTab === 'notifications' && <NotificationsManager />}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation Header */}
      <header className="bg-gradient-to-r from-gray-700 to-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition duration-200"
              onClick={() => {
                setCurrentView('home');
                setActiveTab('home');
              }}
            >
              <Bell className="text-yellow-400 animate-bounce" size={28} />
              <h1 className="text-2xl font-bold text-white">NotifyMe</h1>
            </div>

            {/* Navigation - only show for authenticated users */}
            {user && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-6 py-2 rounded-xl font-medium transition duration-200 flex items-center gap-2 ${
                    activeTab === 'home'
                      ? 'bg-yellow-300 text-gray-900 shadow-md'
                      : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                  }`}
                >
                  <Star size={18} />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-6 py-2 rounded-xl font-medium transition duration-200 flex items-center gap-2 ${
                    activeTab === 'notes'
                      ? 'bg-yellow-300 text-gray-900 shadow-md'
                      : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                  }`}
                >
                  <StickyNote size={18} />
                  Notes
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`px-6 py-2 rounded-xl font-medium transition duration-200 flex items-center gap-2 ${
                    activeTab === 'notifications'
                      ? 'bg-yellow-300 text-gray-900 shadow-md'
                      : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                  }`}
                >
                  <Bell size={18} />
                  Notifications
                </button>
              </div>
            )}

            {/* User section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-white text-sm hidden sm:block">
                    Welcome, {user?.email}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 shadow-md transition duration-200 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentView('login')}
                    className="text-white px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-10 transition duration-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setCurrentView('register')}
                    className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl hover:bg-yellow-300 transition duration-200 font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {currentView === 'login' || currentView === 'register' || currentView === 'verify' ? (
          <AuthContent />
        ) : (
          user ? <DashboardContent /> : <LandingContent />
        )}
      </main>

      {/* Footer - only show for non-authenticated users */}
      {!user && (
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="text-yellow-400" size={24} />
                  <h3 className="text-xl font-bold">NotifyMe</h3>
                </div>
                <p className="text-gray-400">
                  Stay organized and never miss what matters with our smart notification system.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Smart Notifications</li>
                  <li>Note Management</li>
                  <li>Multi-Channel Support</li>
                  <li>Flexible Scheduling</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">About Us</h4>
                <div className="text-gray-400 space-y-2">
                  <p className="text-sm">Created by:</p>
                  <p className="font-medium text-white">Anand Pratap Singh</p>
                  <p className="text-sm">Email : aps236876@gmail.com</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Get Started</h4>
                <div className="space-y-3">
                  <button 
                    onClick={handleGetStarted}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 w-full"
                  >
                    Try NotifyMe Free
                  </button>
                  <button 
                    onClick={() => setCurrentView('register')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200 w-full"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
              <p>&copy; 2025 NotifyMe. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default HomePage;