import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
});

export default apiClient;