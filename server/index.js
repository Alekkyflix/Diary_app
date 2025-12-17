import express from 'express';
import cors from 'cors';
import sequelize from './database.js';
import User from './models/User.js';
import Entry from './models/Entry.js';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 5000;
const SECRET_KEY = 'super_secret_key_change_in_production';

app.use(cors());
app.use(express.json());

// Associations
User.hasMany(Entry, { foreignKey: 'userId' });
Entry.belongsTo(User, { foreignKey: 'userId' });

// Middleware for Auth
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(500).json({ error: 'Failed to authenticate token' });
        req.userId = decoded.id;
        next();
    });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.create({ username, email, password });
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'User registration failed', details: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user || !(await user.validPassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

// --- ENTRY ROUTES ---

app.get('/api/entries', authenticate, async (req, res) => {
    try {
        const entries = await Entry.findAll({ where: { userId: req.userId }, order: [['createdAt', 'DESC']] });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: 'Fetching entries failed' });
    }
});

app.post('/api/entries', authenticate, async (req, res) => {
    try {
        const { title, content } = req.body;
        const entry = await Entry.create({ title, content, userId: req.userId });
        res.json(entry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Creating entry failed' });
    }
});

// Sync DB
sequelize.sync().then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
