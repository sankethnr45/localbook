// server/routes/auth.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authmiddleware');


const prisma = new PrismaClient();
const router = express.Router();

// Endpoint: POST /api/auth/register
router.post('/register', async (req, res) => {
    // 1. Get user data from the request body
    const { email, password, name, role } = req.body;

    // 2. Basic validation: Check if required fields are present
    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    try {
        // 3. Check if a user with this email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 4. Hash the password for security
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Create the new user in the database
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role, // Should be "CUSTOMER" or "PROVIDER"
            },
        });

        // 6. Send a success response (don't send the password back!)
        res.status(201).json({ message: 'User created successfully', userId: newUser.id });

    } catch (error) {
        // 7. Handle any other errors
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Endpoint: POST /api/auth/login
router.post('/login', async (req, res) => {
    // 1. Get email and password from the request body
    const { email, password } = req.body;

    // 2. Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // 3. Find the user in the database by their email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Use a generic error message for security
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 4. Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // Use the same generic error message
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 5. If credentials are valid, create a JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role }, // This is the "payload" of the token
            process.env.JWT_SECRET,               // The secret key from your .env file
            { expiresIn: '24h' }                   // Token expiration time
        );

        // 6. Send the token back in a secure, httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,         // The cookie cannot be accessed by client-side JavaScript
            secure: true,
            sameSite: 'none', // Add this line            // Only send over HTTPS in production
            maxAge: 24 * 60 * 60 * 1000,        // 24 hour in milliseconds
        });

        // 7. Send a success response
        res.status(200).json({ 
            message: 'Logged in successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// This is a protected route
router.get('/profile', protect, (req, res) => {
    // Because of the 'protect' middleware, we have access to req.user
    // If the middleware had failed, this function would never run.
    res.status(200).json({
        message: "Profile data",
        user: req.user
    });
});

// Endpoint: POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;