import express from 'express';
import cors from 'cors';
import sequelize from './database.js';
import User from './models/User.js';
import Entry from './models/Entry.js';
import Badge from './models/Badge.js';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 5000;
const SECRET_KEY = 'super_secret_key_change_in_production';

app.use(cors());
app.use(express.json());

// Associations
User.hasMany(Entry, { foreignKey: 'userId' });
Entry.belongsTo(User, { foreignKey: 'userId' });
User.belongsToMany(Badge, { through: 'UserBadges' }); // Added Badge association
Badge.belongsToMany(User, { through: 'UserBadges' }); // Added Badge association

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
        // Removed duplicate destructuring
        const user = await User.findByPk(req.userId);

        // Streak Logic
        const today = new Date();
        // Normalize today to start of day for consistent comparison
        today.setHours(0, 0, 0, 0);
        const lastEntry = user.lastEntryDate ? new Date(user.lastEntryDate) : null;
        if (lastEntry) {
            lastEntry.setHours(0, 0, 0, 0);
        }

        let newStreak = user.currentStreak;

        if (lastEntry) {
            const diffTime = today.getTime() - lastEntry.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // Use round to handle potential daylight saving issues

            if (diffDays === 1) {
                // Consecutive day
                newStreak += 1;
            } else if (diffDays > 1) {
                // Streak broken
                newStreak = 1;
            } else if (diffDays === 0) {
                // Entry on the same day, do not increment streak
                // Keep current streak, but update lastEntryDate to ensure it's today
            }
        } else {
            newStreak = 1; // First entry starts a streak
        }

        user.currentStreak = newStreak;
        user.lastEntryDate = today; // Store normalized date
        await user.save();

        const { title, content, mood } = req.body;
        const entry = await Entry.create({ title, content, mood, userId: req.userId });

        // Check for Badges
        const awardedBadges = [];
        if (newStreak === 3) awardedBadges.push('3 Day Streak');
        if (newStreak === 7) awardedBadges.push('7 Day Streak');
        if (newStreak === 30) awardedBadges.push('30 Day Streak');

        for (const badgeName of awardedBadges) {
            const badge = await Badge.findOne({ where: { name: badgeName } });
            if (badge) {
                // Check if user already has the badge to prevent duplicates
                const hasBadge = await user.hasBadge(badge);
                if (!hasBadge) {
                    await user.addBadge(badge);
                }
            }
        }

        res.json({ entry, streak: newStreak, badges: awardedBadges });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Creating entry failed' });
    }
});

// --- GAMIFICATION ROUTES ---
app.get('/api/user/gamification', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: Badge
        });
        res.json({
            currentStreak: user.currentStreak,
            badges: user.Badges
        });
    } catch (error) {
        res.status(500).json({ error: 'Fetching gamification data failed' });
    }
});

// Sync DB
sequelize.sync({ alter: true }).then(async () => { // Added async here
    console.log('Database synced');

    // Seed Badges
    const badges = [
        { name: '3 Day Streak', description: 'Wrote for 3 days in a row', icon: 'Flame', criteria: 'streak:3' },
        { name: '7 Day Streak', description: 'Wrote for 7 days in a row', icon: 'Zap', criteria: 'streak:7' },
        { name: '30 Day Streak', description: 'Wrote for 30 days in a row', icon: 'Trophy', criteria: 'streak:30' }
    ];

    for (const b of badges) {
        await Badge.findOrCreate({ where: { name: b.name }, defaults: b });
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
