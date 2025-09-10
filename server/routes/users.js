// server/routes/users.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// GET all users with the role of 'PROVIDER'
router.get('/providers', async (req, res) => {
  try {
    const providers = await prisma.user.findMany({
      where: {
        role: 'PROVIDER',
      },
      select: { // Only send public-safe data
        id: true,
        name: true,
        email: true,
      }
    });
    res.status(200).json(providers);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// server/routes/users.js
// ... (keep the /providers route)

// GET a single provider by ID, including their services
router.get('/provider/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const provider = await prisma.user.findUnique({
      where: { id: id, role: 'PROVIDER' },
      select: {
        id: true,
        name: true,
        email: true,
        services: true, // This tells Prisma to include the related services
      }
    });

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json(provider);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

module.exports = router;