import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api';
import BookingCalendar from '../components/BookingCalendar';

const fetchProviderDetails = async (providerId) => {
  const { data } = await apiClient.get(`/users/provider/${providerId}`);
  return data;
};

const ProviderBookingPage = () => {
  const { providerId } = useParams();

  const { data: provider, error, isLoading } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => fetchProviderDetails(providerId),
  });

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading provider details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-12">
      <div className="text-red-600 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Provider</h2>
      <p className="text-gray-600">{error.message}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Book a Service with {provider.name}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose from the services below and select your preferred time
        </p>
      </div>

      {/* Services Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-green-600 text-lg">🔧</span>
          </span>
          Services Offered
        </h2>
        
        {provider.services?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {provider.services.map(service => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="font-medium text-green-600">${service.price.toFixed(2)}</span>
                  <span>{service.duration} minutes</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <p className="text-gray-600 text-lg">This provider has not listed any services yet.</p>
            <p className="text-gray-500 text-sm mt-2">Please check back later</p>
          </div>
        )}
      </div>

      {/* Booking Calendar */}
      {provider.services?.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 text-lg">📅</span>
            </span>
            Select Your Time
          </h2>
          <BookingCalendar providerId={provider.id} services={provider.services} />
        </div>
      )}
    </div>
  );
};

export default ProviderBookingPage;