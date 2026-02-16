import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api', // Use relative path for proxy or env var
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the token in every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
