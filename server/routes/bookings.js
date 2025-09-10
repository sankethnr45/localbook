// server/routes/bookings.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/authmiddleware'); // Customers don't need to be providers

const prisma = new PrismaClient();
const router = express.Router();

// GET available booking slots for a specific provider, service, and date
router.get('/availability/:providerId', async (req, res) => {
    const { providerId } = req.params;
    const { date, serviceId } = req.query; // e.g., date=2024-08-15&serviceId=...

    if (!date || !serviceId) {
        return res.status(400).json({ message: 'Date and Service ID are required' });
    }

    try {
        const targetDate = new Date(date);
        const dayOfWeek = targetDate.getUTCDay(); // 0 for Sunday, 1 for Monday etc.

        // 1. Fetch the service to get its duration
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        const serviceDuration = service.duration; // in minutes

        // 2. Fetch the provider's general availability for that day of the week
        const providerAvailability = await prisma.availability.findFirst({
            where: { providerId, dayOfWeek },
        });

        if (!providerAvailability) {
            return res.status(200).json([]); // No availability for this day, return empty array
        }

        // 3. Fetch all existing bookings for the provider on that specific date
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const existingBookings = await prisma.booking.findMany({
            where: {
                service: { providerId: providerId },
                startTime: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
        });

        // 4. Generate all possible time slots and filter out the unavailable ones
        const availableSlots = [];
        const [startHour, startMinute] = providerAvailability.startTime.split(':').map(Number);
        const [endHour, endMinute] = providerAvailability.endTime.split(':').map(Number);

        let currentSlotTime = new Date(date);
        currentSlotTime.setUTCHours(startHour, startMinute, 0, 0);

        const endTime = new Date(date);
        endTime.setUTCHours(endHour, endMinute, 0, 0);

        while (currentSlotTime < endTime) {
            const slotEndTime = new Date(currentSlotTime.getTime() + serviceDuration * 60000);
            
            if (slotEndTime > endTime) break; // Don't create slots that go past the end time

            // Check for conflicts with existing bookings
            const isSlotTaken = existingBookings.some(booking =>
                (currentSlotTime >= booking.startTime && currentSlotTime < booking.endTime) ||
                (slotEndTime > booking.startTime && slotEndTime <= booking.endTime)
            );

            if (!isSlotTaken) {
                availableSlots.push(new Date(currentSlotTime));
            }

            // Move to the next slot (we'll assume slots start every 30 mins for simplicity)
            currentSlotTime.setMinutes(currentSlotTime.getMinutes() + 30);
        }

        res.status(200).json(availableSlots);

    } catch (error) {
        console.error("SLOT CALCULATION ERROR:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// CREATE a new booking

router.post('/', protect, async (req, res) => {
  const { serviceId, startTime } = req.body;
  const customerId = req.user.id;

  if (!serviceId || !startTime) {
    return res.status(400).json({ message: 'Service ID and start time are required' });
  }

  try {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const bookingStartTime = new Date(startTime);
    const bookingEndTime = new Date(bookingStartTime.getTime() + service.duration * 60000);

    const newBooking = await prisma.booking.create({
      data: {
        startTime: bookingStartTime,
        endTime: bookingEndTime,
        customerId,
        serviceId,
      },
    });

    // --- START OF NOTIFICATION LOGIC ---
    const providerId = service.providerId;
    const notificationMessage = `You have a new booking for "${service.name}" at ${bookingStartTime.toLocaleTimeString()}`;

    // DEBUGGING: Log what the server is doing
    console.log(`Attempting to emit notification to room: ${providerId}`);
    
    req.io.to(providerId).emit('new-booking', { message: notificationMessage });
    // --- END OF NOTIFICATION LOGIC ---

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("BOOKING CREATION ERROR:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET all bookings for the currently logged-in customer
router.get('/my-bookings', protect, async (req, res) => {
  const customerId = req.user.id;
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        customerId: customerId,
      },
      include: { // Include related service and provider details
        service: {
          include: {
            provider: {
              select: { name: true } // Only select the provider's name
            }
          }
        }
      },
      orderBy: {
        startTime: 'desc', // Show the most recent bookings first
      },
    });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("FETCH MY BOOKINGS ERROR:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router;