// server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
    let token;

    // 1. Read the token from the cookie
    if (req.cookies && req.cookies.token) {
        try {
            // 2. Get the token from the cookie
            token = req.cookies.token;

            // 3. Verify the token using our secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find the user based on the ID from the token's payload
            //    and attach the user object to the request (excluding the password)
            req.user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, name: true, role: true }
            });

            // 5. Move on to the next function (the actual route handler)
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If there's no token at all
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const isProvider = (req, res, next) => {
    if (req.user && req.user.role === 'PROVIDER') {
        next(); // User is a provider, proceed
    } else {
        res.status(403).json({ message: 'Not authorized as a provider' });
    }
};

module.exports = { protect,isProvider };