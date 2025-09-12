LocalBook - A Full-Stack Service Booking Platform

Welcome to LocalBook! This is a complete, full-stack web application I built from the ground up to solve a simple problem: small service providers need a straightforward way to manage their bookings without paying for complex, expensive software. This platform connects customers with local professionals, handling everything from service listings to real-time appointment booking.

## Live Demos
Live Frontend (Vercel): https://localbook-theta.vercel.app/

Live Backend API (Render): https://localbook-api-final.onrender.com/

## Why I Built This
I wanted to build a single, comprehensive portfolio project that went beyond a simple to-do list. The goal was to tackle a real-world problem and build a solution using a modern, professional tech stack and workflow. This project was a deep dive into building a secure, role-based system, managing complex state, and, most importantly, navigating the challenges of a full-scale production deployment. The journey was filled with tough debugging sessions, especially during deployment, but overcoming those hurdles was the most valuable part of the experience.

##  Core Features
Dual User Roles: A complete authentication system that distinguishes between Customers and Service Providers, each with their own unique interface and permissions.

Provider Management Hub (/manage): A dedicated, protected route where providers can:

Create, Read, Update, and Delete the services they offer.

Set their weekly work schedule using an interactive availability manager.

Customer Booking Flow: An intuitive process for customers to:

View all available providers.

Select a provider to see their specific services.

Choose a service and a date to see real-time available time slots, calculated on the fly.

Book an appointment.

Real-Time Notifications: When a booking is made, the service provider receives an instant notification using a live Socket.IO connection, without needing to refresh their page.

Role-Based Dashboards:

Providers are greeted with an "at-a-glance" dashboard summarizing their upcoming appointments and monthly stats.

Customers have a dedicated "My Bookings" page to view their appointment history.

##  Technology & Architecture
This project is a monorepo containing a full-stack application.

Frontend:

Framework: React (Vite + SWC)

Routing: React Router

State Management: TanStack Query for server state, caching, and automatic refetching. React Context for global auth state.

Styling: MUI (Material-UI) for a clean, professional component library.

API Communication: Axios

Backend:

Runtime: Node.js

Framework: Express.js

Database: PostgreSQL

ORM: Prisma for type-safe database access and migrations.

Authentication: Secure, httpOnly cookie-based JWT authentication.

Real-Time: Socket.IO for WebSocket communication.

Deployment & DevOps:

Containerization: The backend is containerized using Docker.

Hosting:

Backend & DB: Deployed on Render by building the Dockerfile directly from the Git repository.

Frontend: Deployed on Vercel with client-side routing configured via vercel.json.

##  Running Locally
To get this project running on your own machine:

Clone the repository:

Bash

git clone https://github.com/sankethnr45/localbook.git
cd localbook
Set up the backend & database:

Bash

# Start the PostgreSQL database in a Docker container
docker-compose up -d

# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file and copy variables from .env.example
# Run database migrations to create the tables
npx prisma migrate dev

# Start the local server
npm run dev
Set up the frontend:

Bash

# From the root, navigate to the client directory
cd client

# Install dependencies
npm install

# Start the local development server
npm run dev
##  Key Learnings & Challenges
Building LocalBook was an incredible learning experience, especially in bridging the gap between local development and a live production environment. The biggest challenges, and therefore the biggest lessons, came from the deployment process. I navigated and solved a series of complex, real-world issues, including:

Docker Architecture Mismatches: Debugging Exec format errors by building Docker images for the correct target platform (amd64 vs. arm64).

Prisma Engine Compatibility: Resolving deep-level compatibility issues between Prisma's binary engines and the specific Linux libraries (OpenSSL) available in different base Docker images (alpine vs. debian). This required precise configuration in both the Dockerfile and schema.prisma.

CORS and Cross-Domain Cookies: Implementing a secure authentication flow that works across different domains (vercel.app and onrender.com) by correctly configuring SameSite cookies and CORS policies.

Monorepo Deployment: Configuring both Render and Vercel to correctly build from subdirectories (/server and /client) in a single Git repository.

This project solidified my understanding of what it truly takes to build and maintain a full-stack application from concept to a live, functioning product.
