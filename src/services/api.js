// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://sports-web-backend.vercel.app/api',
  withCredentials: true, // if using cookies
  headers: {
    'Content-Type': 'application/json', // ✅ ensures payload is sent
  },
});

export default API;
