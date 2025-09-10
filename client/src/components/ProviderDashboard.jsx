import { useQuery } from '@tanstack/react-query';
import apiClient from '../api';
import AddServiceForm from './AddServiceForm';
import ManageAvailability from './ManageAvailability';

const fetchMyServices = async () => {
  const { data } = await apiClient.get('/services/my-services');
  return data;
};

const ProviderDashboard = () => {
  const { data: services, error, isLoading } = useQuery({
    queryKey: ['myServices'],
    queryFn: fetchMyServices,
  });

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading your business details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-12">
      <div className="text-red-600 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Business</h2>
      <p className="text-gray-600">{error.message}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Your Business</h1>
        <p className="text-gray-600">Add services, manage availability, and grow your business</p>
      </div>
      
      {/* Add Service Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-green-600 text-lg">➕</span>
          </span>
          Add New Service
        </h2>
        <AddServiceForm />
      </div>
      
      {/* Manage Availability */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-green-600 text-lg">📅</span>
          </span>
          Manage Availability
        </h2>
        <ManageAvailability />
      </div>

      {/* My Services */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-green-600 text-lg">🔧</span>
          </span>
          My Services
        </h2>
        
        {services.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <p className="text-gray-600 text-lg">You haven't added any services yet.</p>
            <p className="text-gray-500 text-sm mt-2">Start by adding your first service above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(service => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="font-medium text-green-600">${service.price.toFixed(2)}</span>
                  <span>{service.duration} minutes</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors duration-200">
                    Edit
                  </button>
                  <button className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors duration-200">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;