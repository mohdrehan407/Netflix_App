const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const { pool, initializeDb } = require('./db');
const USERS_FILE = path.join(__dirname, 'users.json');
const WATCHLIST_FILE = path.join(__dirname, 'watchlist.json');

const JWT_SECRET = process.env.JWT_SECRET || 'netflix_secret_key_123';

// Initialize Database & JSON files
try {
    initializeDb();
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
    if (!fs.existsSync(WATCHLIST_FILE)) fs.writeFileSync(WATCHLIST_FILE, JSON.stringify([]));
} catch (error) {
    console.error("Critical: Initialization failed:", error.message);
}

// Keep-alive to prevent premature exit
setInterval(() => { }, 1000 * 60 * 60);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth Endpoints
app.post('/api/auth/signup', async (req, res) => {
    console.log(`Backend: Signup attempt for ${req.body.email}`);
    try {
        const { uname, email, password, phone } = req.body;
        const uid = 'kod' + Math.floor(Math.random() * 10000);
        const hashedPassword = await bcrypt.hash(password, 10);

        if (pool) {
            const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (userCheck.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

            const newUserQuery = `INSERT INTO users (uid, uname, email, password, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
            const result = await pool.query(newUserQuery, [uid, uname, email, hashedPassword, phone]);
            const newUser = result.rows[0];
            const token = jwt.sign({ id: newUser.uid, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
            return res.status(201).json({ token, user: newUser });
        } else {
            // Fallback to JSON
            const users = JSON.parse(fs.readFileSync(USERS_FILE));
            if (users.find(u => u.email === email)) return res.status(400).json({ error: 'User already exists' });

            const newUser = { uid, uname, email, password: hashedPassword, phone };
            users.push(newUser);
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
            const token = jwt.sign({ id: uid, email }, JWT_SECRET, { expiresIn: '7d' });
            return res.status(201).json({ token, user: newUser });
        }
    } catch (error) {
        console.error(`Backend: Signup error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    console.log(`Backend: Login attempt for ${req.body.email}`);
    try {
        const { email, password } = req.body;
        let user;

        if (pool) {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            user = result.rows[0];
        } else {
            const users = JSON.parse(fs.readFileSync(USERS_FILE));
            user = users.find(u => u.email === email);
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.uid, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { uid: user.uid, uname: user.uname, email: user.email, phone: user.phone } });
    } catch (error) {
        console.error(`Backend: Login error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/movies/:type', async (req, res) => {
    console.log(`Backend: Fetching ${req.params.type} movies...`);
    try {
        const { type } = req.params;
        const { page = 1 } = req.query;
        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        if (!TMDB_API_KEY) {
            return res.status(500).json({ error: 'TMDB API Key missing' });
        }

        const typeConfig = {
            trending: { path: '/trending/all/week', params: {} },
            originals: { path: '/discover/tv', params: { with_networks: 213 } },
            top_rated: { path: '/movie/top_rated', params: {} },
            action: { path: '/discover/movie', params: { with_genres: 28 } },
            comedy: { path: '/discover/movie', params: { with_genres: 35 } },
            horror: { path: '/discover/movie', params: { with_genres: 27 } },
            romance: { path: '/discover/movie', params: { with_genres: 10749 } },
            documentaries: { path: '/discover/movie', params: { with_genres: 99 } },
        };

        const config = typeConfig[type] || typeConfig.trending;
        const response = await axios.get(`https://api.themoviedb.org/3${config.path}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
                page,
                ...config.params
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching movies:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        if (!TMDB_API_KEY) {
            return res.status(500).json({ error: 'TMDB API Key missing' });
        }

        const response = await axios.get(`https://api.themoviedb.org/3/search/multi`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
                query: q,
                include_adult: false,
            },
        });

        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.get('/api/details/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        // Normalize type (tv or movie)
        const mediaType = type === 'tv' ? 'tv' : 'movie';

        const response = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${id}`, {
            params: {
                api_key: TMDB_API_KEY,
                append_to_response: 'videos,credits,similar',
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching ${req.params.type} details:`, error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Watchlist endpoints
app.get('/api/watchlist', async (req, res) => {
    try {
        if (pool) {
            const result = await pool.query('SELECT movie_data FROM watchlist');
            return res.json(result.rows.map(row => row.movie_data));
        } else {
            const data = fs.readFileSync(WATCHLIST_FILE);
            return res.json(JSON.parse(data));
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/watchlist', async (req, res) => {
    try {
        const movie = req.body;
        if (pool) {
            const userId = 'global_user';
            await pool.query("INSERT INTO users (uid, uname, email, password) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
                ['global_user', 'Global User', 'global@example.com', 'nopass']);
            await pool.query('INSERT INTO watchlist (user_id, movie_id, movie_data) VALUES ($1, $2, $3) ON CONFLICT (user_id, movie_id) DO NOTHING',
                [userId, movie.id, JSON.stringify(movie)]);
            const result = await pool.query('SELECT movie_data FROM watchlist');
            return res.json(result.rows.map(row => row.movie_data));
        } else {
            const data = JSON.parse(fs.readFileSync(WATCHLIST_FILE));
            if (!data.find(m => m.id === movie.id)) {
                data.push(movie);
                fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(data, null, 2));
            }
            return res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/watchlist/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (pool) {
            await pool.query('DELETE FROM watchlist WHERE movie_id = $1', [id]);
            const result = await pool.query('SELECT movie_data FROM watchlist');
            return res.json(result.rows.map(row => row.movie_data));
        } else {
            let data = JSON.parse(fs.readFileSync(WATCHLIST_FILE));
            data = data.filter(m => m.id !== parseInt(id));
            fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(data, null, 2));
            return res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    const key = process.env.TMDB_API_KEY;
    if (!key || key === 'YOUR_TMDB_API_KEY_HERE') {
        console.warn('⚠️ WARNING: TMDB_API_KEY is not set correctly in backend/.env.');
    } else {
        console.log(`✅ TMDB_API_KEY loaded: ${key.substring(0, 4)}...${key.substring(key.length - 4)}`);
    }
});

server.on('error', (error) => {
    console.error('Server error:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error.message);
});
