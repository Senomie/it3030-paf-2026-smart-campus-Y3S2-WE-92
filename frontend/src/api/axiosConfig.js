import axios from 'axios';
import { API_ORIGIN } from '../config/api';

const api = axios.create({
    baseURL: `${API_ORIGIN}/api`,
});

// Request Interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
