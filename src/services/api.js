// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: '/api',   // ✅ bas itna hi
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
