import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api';

const daysOfWeek = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 0, name: 'Sunday' },
];

// API function to fetch current availability
const fetchAvailability = async () => {
  const { data } = await apiClient.get('/availability');
  return data;
};

// API function to update availability
const updateAvailability = async (newAvailability) => {
  const { data } = await apiClient.post('/availability', { availability: newAvailability });
  return data;
};

const ManageAvailability = () => {
  const [schedule, setSchedule] = useState({});
  const queryClient = useQueryClient();

  const { data: currentAvailability, isLoading } = useQuery({
    queryKey: ['myAvailability'],
    queryFn: fetchAvailability,
  });

  // When the fetched data arrives, update our local form state
  useEffect(() => {
    if (currentAvailability) {
      const newSchedule = {};
      // Initialize all days to inactive with default times
      daysOfWeek.forEach(day => {
        newSchedule[day.id] = { isActive: false, startTime: '09:00', endTime: '17:00' };
      });
      // Overwrite with fetched data for any active days
      currentAvailability.forEach(slot => {
        newSchedule[slot.dayOfWeek] = {
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: true,
        };
      });
      setSchedule(newSchedule);
    }
  }, [currentAvailability]);

  const mutation = useMutation({
    mutationFn: updateAvailability,
    onSuccess: () => {
      alert('Schedule updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['myAvailability'] });
    },
    onError: (error) => {
      alert(`Failed to update schedule: ${error.message}`);
    }
  });

  // Handle changes to the form (e.g., changing a start time or checking a box)
  const handleScheduleChange = (dayId, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value,
      },
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedSchedule = Object.entries(schedule)
      .filter(([, details]) => details.isActive) // Only include days where the box is checked
      .map(([dayId, details]) => ({
        dayOfWeek: parseInt(dayId),
        startTime: details.startTime,
        endTime: details.endTime,
      }));
    mutation.mutate(formattedSchedule);
  };

  if (isLoading) {
    return <p>Loading your schedule...</p>;
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Manage Your Weekly Availability</h3>
      <form onSubmit={handleSubmit}>
        {daysOfWeek.map(day => (
          <div key={day.id} style={{ display: 'flex', gap: '1rem', margin: '0.5rem 0', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={schedule[day.id]?.isActive || false}
              onChange={(e) => handleScheduleChange(day.id, 'isActive', e.target.checked)}
            />
            <label style={{ width: '100px' }}>{day.name}</label>
            <input
              type="time"
              value={schedule[day.id]?.startTime || '09:00'}
              onChange={(e) => handleScheduleChange(day.id, 'startTime', e.target.value)}
              disabled={!schedule[day.id]?.isActive}
            />
            <span>to</span>
            <input
              type="time"
              value={schedule[day.id]?.endTime || '17:00'}
              onChange={(e) => handleScheduleChange(day.id, 'endTime', e.target.value)}
              disabled={!schedule[day.id]?.isActive}
            />
          </div>
        ))}
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save Schedule'}
        </button>
      </form>
    </div>
  );
};

export default ManageAvailability;