// server/routes/services.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect, isProvider } = require('../middleware/authmiddleware');

const prisma = new PrismaClient();
const router = express.Router();

// We will chain our middleware. Express runs them in order.
// First 'protect' runs, then 'isProvider' runs.

// CREATE a new service
router.post('/', protect, isProvider, async (req, res) => {
    const { name, description, price, duration } = req.body;
    const providerId = req.user.id; // Get provider ID from the logged-in user

    if (!name || !price || !duration) {
        return res.status(400).json({ message: 'Name, price, and duration are required' });
    }

    try {
        const service = await prisma.service.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                duration: parseInt(duration),
                providerId,
            },
        });
        res.status(201).json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// READ all services for the logged-in provider
router.get('/my-services', protect, isProvider, async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            where: { providerId: req.user.id },
        });
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// UPDATE a service
router.put('/:serviceId', protect, isProvider, async (req, res) => {
    const { serviceId } = req.params;
    const { name, description, price, duration } = req.body;

   try {
    // First, verify the service belongs to the provider
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.providerId !== req.user.id) {
        return res.status(404).json({ message: 'Service not found or you do not own this service' });
    }

    // Create an object to hold only the data we want to update
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (duration) updateData.duration = parseInt(duration);
   

    const updatedService = await prisma.service.update({
        where: { id: serviceId },
        data: updateData, // Use the new object here
    });
    res.status(200).json(updatedService);
} catch (error) {
    // ADD THIS LINE TO SEE THE REAL ERROR
    console.error("UPDATE ERROR:", error); 
    res.status(500).json({ message: 'Internal server error' });
}
});

// DELETE a service
router.delete('/:serviceId', protect, isProvider, async (req, res) => {
    const { serviceId } = req.params;

    try {
        // Verify the service belongs to the provider
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service || service.providerId !== req.user.id) {
            return res.status(404).json({ message: 'Service not found or you do not own this service' });
        }

        await prisma.service.delete({ where: { id: serviceId } });
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;