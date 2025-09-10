import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../api';

const fetchProviders = async () => {
  const { data } = await apiClient.get('/users/providers');
  return data;
};

const CustomerHomePage = () => {
  const { data: providers, error, isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: fetchProviders,
  });

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading providers...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-12">
      <div className="text-red-600 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Providers</h2>
      <p className="text-gray-600">{error.message}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Our Service Providers
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover trusted local professionals ready to help with your needs
        </p>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map(provider => (
          <div key={provider.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-6">
              {/* Provider Avatar */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-700 font-bold text-xl">
                  {provider.name ? provider.name.charAt(0).toUpperCase() : 'P'}
                </span>
              </div>
              
              {/* Provider Info */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {provider.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {provider.email}
                </p>
              </div>
              
              {/* Action Button */}
              <RouterLink to={`/book/${provider.id}`} className="block">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md">
                  View Services & Book
                </button>
              </RouterLink>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {providers.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Providers Available</h3>
          <p className="text-gray-600 mb-6">Check back later for new service providers in your area.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerHomePage;