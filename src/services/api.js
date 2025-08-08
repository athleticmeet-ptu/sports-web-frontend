// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: '/api' ||'https://localhost:5000/api',
  withCredentials: true, // if using cookies
  headers: {
    'Content-Type': 'application/json', // ✅ ensures payload is sent
  },
});

export default API;
