// Centralized API Configuration
// Vite uses 'import.meta.env' for environment variables.
// In development, VITE_API_URL can be undefined and will fallback to localhost.
// In production (Render), you should set VITE_API_URL in the dashboard.

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default API_URL;
