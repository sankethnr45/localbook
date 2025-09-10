// server/routes/dashboard.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect, isProvider } = require('../middleware/authmiddleware');

const prisma = new PrismaClient();
const router = express.Router();

// GET dashboard stats for the logged-in provider
router.get('/', protect, isProvider, async (req, res) => {
  const providerId = req.user.id;

  try {
    // 1. Get upcoming bookings (today and tomorrow)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        service: { providerId: providerId },
        startTime: {
          gte: today,
          lt: dayAfterTomorrow,
        },
      },
      include: {
        service: { select: { name: true } },
        customer: { select: { name: true, email: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    // 2. Calculate stats for the current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthlyBookings = await prisma.booking.findMany({
        where: {
            service: { providerId: providerId },
            startTime: {
                gte: startOfMonth,
                lt: endOfMonth,
            }
        },
        include: {
            service: { select: { price: true } }
        }
    });

    const totalEarnings = monthlyBookings.reduce((sum, booking) => sum + booking.service.price, 0);
    const totalBookings = monthlyBookings.length;

    // 3. Send all data back in one response
    res.status(200).json({
      upcomingBookings,
      stats: {
        totalEarnings,
        totalBookings,
      },
    });

  } catch (error) {
    console.error("DASHBOARD_STATS_ERROR:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;