import { Routes, Route, Link as RouterLink, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import Layout & Handlers
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationHandler from './components/NotificationHandler';

// Import All Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerHomePage from './pages/CustomerHomePage';
import ProviderHomePage from './pages/ProviderHomePage';
import DashboardPage from './pages/DashboardPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProviderBookingPage from './pages/ProviderBookingPage';

function App() {
  const { user, logout } = useAuth();

  const Home = () => {
    if (!user) return <LandingPage />;
    if (user.role === 'PROVIDER') return <Navigate to="/dashboard" />;
    return <CustomerHomePage />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationHandler />
      
      {/* Modern Professional Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <RouterLink to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-bold text-gray-900">LocalBook</span>
              </RouterLink>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Customer-specific links */}
              {user?.role === 'CUSTOMER' && (
                <RouterLink 
                  to="/my-bookings" 
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  My Bookings
                </RouterLink>
              )}
              
              {/* Provider-specific links */}
              {user?.role === 'PROVIDER' && (
                <>
                  <RouterLink 
                    to="/dashboard" 
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Dashboard
                  </RouterLink>
                  <RouterLink 
                    to="/manage" 
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Manage Business
                  </RouterLink>
                </>
              )}
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-medium text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 font-medium hidden sm:block">
                      {user.name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 border border-red-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <RouterLink
                    to="/login"
                    className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Sign In
                  </RouterLink>
                  <RouterLink
                    to="/register"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    Get Started
                  </RouterLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/providers" element={<CustomerHomePage />} />
            <Route path="/book/:providerId" element={<ProviderBookingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/manage" element={<ProtectedRoute><ProviderHomePage /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </main>
    </div>
  );
}

export default App;