import { useQuery } from '@tanstack/react-query';
import apiClient from '../api';

const fetchMyBookings = async () => {
  const { data } = await apiClient.get('/bookings/my-bookings');
  return data;
};

const MyBookings = () => {
  const { data: bookings, error, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: fetchMyBookings,
  });

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading your bookings...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-12">
      <div className="text-red-600 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Bookings</h2>
      <p className="text-gray-600">{error.message}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          My Bookings
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Track all your upcoming and past service appointments
        </p>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
          <p className="text-gray-600 mb-6">You haven't made any service bookings yet.</p>
          <a href="/providers" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
            Find Services
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 text-lg">🔧</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{booking.service.name}</h3>
                      <p className="text-gray-600">with {booking.service.provider.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">📅</span>
                      <span className="text-gray-700">{new Date(booking.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">🕐</span>
                      <span className="text-gray-700">{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Confirmed
                  </span>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;