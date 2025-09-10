// src/pages/DashboardPage.jsx
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api';
import { Link } from 'react-router-dom';

// API function to fetch the dashboard data
const fetchDashboardData = async () => {
  const { data } = await apiClient.get('/dashboard');
  return data;
};

const DashboardPage = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
  });

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading your dashboard...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-12">
      <div className="text-red-600 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
      <p className="text-gray-600">{error.message}</p>
    </div>
  );

  const { upcomingBookings, stats } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Total Earnings (This Month)</h3>
              <p className="text-3xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Total Bookings (This Month)</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Appointments (Today & Tomorrow)</h2>
        
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 text-6xl mb-4">📋</div>
            <p className="text-gray-600 text-lg">You have no upcoming appointments.</p>
            <p className="text-gray-500 text-sm mt-2">New bookings will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map(booking => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{booking.service.name}</h4>
                    <p className="text-gray-600">with {booking.customer.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {new Date(booking.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;