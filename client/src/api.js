import axios from 'axios';

// This line reads the VITE_API_BASE_URL from Vercel's environment.
// If it doesn't exist (like in local development), it defaults to your local server.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// Log the base URL to confirm it's using the correct one
console.log("API client initialized with baseURL:", baseURL);

export default apiClient;