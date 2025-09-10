import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// MUI Imports
import { Typography, Box, Grid, FormControl, InputLabel, Select, MenuItem, TextField, Button, CircularProgress } from '@mui/material';

const getISODate = (date) => {
  return date.toISOString().split('T')[0];
};

const BookingCalendar = ({ providerId, services }) => {
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(getISODate(new Date()));
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: availableSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ['availability', providerId, selectedDate, selectedServiceId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/bookings/availability/${providerId}`, {
        params: { date: selectedDate, serviceId: selectedServiceId },
      });
      return data;
    },
    enabled: !!selectedServiceId && !!selectedDate,
  });

  const bookingMutation = useMutation({
    mutationFn: async (startTime) => {
      if (!user) {
        throw new Error('You must be logged in to book a service.');
      }
      return apiClient.post('/bookings', { serviceId: selectedServiceId, startTime });
    },
    onSuccess: () => {
      alert('Booking successful!');
      queryClient.invalidateQueries({ queryKey: ['availability', providerId, selectedDate, selectedServiceId] });
    },
    onError: (error) => {
      alert(`Booking failed: ${error.message}`);
      if (error.message.includes('logged in')) {
        navigate('/login');
      }
    }
  });

  return (
    <Box>
      <Typography variant="h5" component="h3" gutterBottom>
        Book an Appointment
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="service-select-label">Select Service</InputLabel>
            <Select
              labelId="service-select-label"
              value={selectedServiceId}
              label="Select Service"
              onChange={(e) => setSelectedServiceId(e.target.value)}
            >
              {services.map(service => (
                <MenuItem key={service.id} value={service.id}>{service.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="date"
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Available Slots:</Typography>
        {slotsLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <CircularProgress size={24} />
            <Typography>Finding available slots...</Typography>
          </Box>
        ) : (
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {availableSlots?.length > 0 ? (
              availableSlots.map(slot => (
                <Grid item key={slot}>
                  <Button
                    variant="outlined"
                    onClick={() => bookingMutation.mutate(slot)}
                    disabled={bookingMutation.isPending}
                  >
                    {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Button>
                </Grid>
              ))
            ) : (
              <Typography sx={{ mt: 2 }}>No available slots for this day. Please select another date.</Typography>
            )}
          </Grid>
        )}
        {bookingMutation.isPending && <Typography sx={{ mt: 2 }}>Booking your appointment...</Typography>}
      </Box>
    </Box>
  );
};

export default BookingCalendar;