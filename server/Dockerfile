# ---- Stage 1: Build ----
# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .
# --- START OF FIX ---
# Tell Prisma which engine to use for the Alpine Linux environment
ENV PRISMA_CLI_BINARY_TARGETS="native,linux-musl-openssl-1.1.x"
# --- END OF FIX ---
# Generate the Prisma client based on your schema
RUN npx prisma generate

# ---- Stage 2: Production ----
# Use a smaller, more secure base image for the final product
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy dependencies from the build stage
COPY --from=build /usr/src/app/node_modules ./node_modules

# Copy Prisma client from the build stage
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /usr/src/app/prisma ./prisma

# Copy the rest of the application code from the build stage
COPY --from=build /usr/src/app .

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run your app
CMD [ "node", "index.js" ]