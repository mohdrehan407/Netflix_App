import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = {
    getMovies: async (type) => {
        try {
            if (type === 'watchlist') {
                const response = await axios.get(`${API_BASE_URL}/watchlist`);
                return response.data;
            }
            const response = await axios.get(`${API_BASE_URL}/movies/${type}`);
            return response.data.results;
        } catch (error) {
            if (error.response?.status === 401) {
                console.error("TMDB API Key is invalid or missing. Please check your backend/.env file.");
            }
            console.error(`Error fetching ${type} movies:`, error);
            return [];
        }
    },
    getMovieDetails: async (type, id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/details/${type || 'movie'}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching details:', error);
            return null;
        }
    },
    searchMovies: async (query) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/search?q=${query}`);
            return response.data.results;
        } catch (error) {
            console.error('Error searching movies:', error);
            return [];
        }
    },
    getWatchlist: async () => {
        const response = await axios.get(`${API_BASE_URL}/watchlist`);
        return response.data;
    },
    addToWatchlist: async (movie) => {
        const response = await axios.post(`${API_BASE_URL}/watchlist`, movie);
        return response.data;
    },
    removeFromWatchlist: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/watchlist/${id}`);
        return response.data;
    },
    login: async (email, password) => {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        if (response.data.token) localStorage.setItem('token', response.data.token);
        return response.data;
    },
    signup: async (uname, email, password, phone) => {
        const response = await axios.post(`${API_BASE_URL}/auth/signup`, { uname, email, password, phone });
        if (response.data.token) localStorage.setItem('token', response.data.token);
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
    }
};

export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original/";
export const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500/";

export default api;
