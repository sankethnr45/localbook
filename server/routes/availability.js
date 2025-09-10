// server/routes/availability.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect, isProvider } = require('../middleware/authmiddleware');

const prisma = new PrismaClient();
const router = express.Router();

// SET/UPDATE Provider Availability
// This will replace the provider's entire existing availability schedule.
router.post('/', protect, isProvider, async (req, res) => {
    // Expecting an array of availability objects in the request body
    // e.g., [{ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }, ...]
    const { availability } = req.body;
    const providerId = req.user.id;

    if (!Array.isArray(availability)) {
        return res.status(400).json({ message: 'Availability data must be an array' });
    }

    try {
        // Use a transaction to ensure data integrity.
        // This makes sure both operations (delete and create) succeed or fail together.
        const result = await prisma.$transaction(async (tx) => {
            // 1. Delete all existing availability for this provider
            await tx.availability.deleteMany({
                where: { providerId: providerId },
            });

            // 2. Create the new availability records
            const newAvailability = await tx.availability.createMany({
                data: availability.map(slot => ({
                    ...slot,
                    providerId: providerId,
                })),
            });

            return newAvailability;
        });

        res.status(201).json({ message: 'Availability set successfully', count: result.count });

    } catch (error) {
        console.error("AVAILABILITY ERROR:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// GET Provider Availability
router.get('/', protect, isProvider, async (req, res) => {
    const providerId = req.user.id;
    try {
        const availability = await prisma.availability.findMany({
            where: { providerId: providerId },
            orderBy: { dayOfWeek: 'asc' } // Return the schedule sorted by day
        });
        res.status(200).json(availability);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;