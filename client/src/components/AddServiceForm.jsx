// src/components/AddServiceForm.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api';

// This is the function that will send the new service data to the API
const addService = async (newService) => {
  const { data } = await apiClient.post('/services', newService);
  return data;
};

const AddServiceForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addService,
    onSuccess: () => {
      // When the mutation is successful, invalidate the 'myServices' query.
      // This tells TanStack Query to automatically refetch the services list.
      queryClient.invalidateQueries({ queryKey: ['myServices'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newService = {
      name,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
    };
    mutation.mutate(newService);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Service Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., House Cleaning, Plumbing"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the service"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              min="15"
              step="15"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </span>
            ) : (
              'Add Service'
            )}
          </button>
          
          {mutation.isError && (
            <p className="text-red-600 text-sm">{mutation.error.message}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddServiceForm;