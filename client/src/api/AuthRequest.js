import axios from 'axios';

const API = axios.create({ 
    baseURL: 'http://localhost:5000',
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for debugging
API.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url, 'with data:', config.data);
        return config;
    },
    (error) => {
        console.log('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
API.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status, response.data);
        return response;
    },
    (error) => {
        console.log('Response error:', error.message);
        if (error.code === 'ECONNABORTED') {
            console.log('Request timeout - server might not be running');
        }
        if (error.code === 'ERR_NETWORK') {
            console.log('Network error - check if server is running on port 5000');
        }
        return Promise.reject(error);
    }
);

export const logIn = (formData) => API.post('/auth/login', formData); 

export const signUp = (formData) => API.post('/auth/register', formData);