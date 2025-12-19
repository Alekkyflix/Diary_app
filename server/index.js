import express from 'express';
import { Op } from 'sequelize';
import cors from 'cors';
import sequelize from './database.js';
import zlib from 'zlib';
import multer from 'multer';
import jwt from 'jsonwebtoken';

// Models
import User from './models/User.js';
import Entry from './models/Entry.js';
import Badge from './models/Badge.js';
import Group from './models/Group.js';
import UserGroup from './models/UserGroup.js';
import Message from './models/Message.js';
import Feedback from './models/Feedback.js';
import DailySnap from './models/DailySnap.js';
import Reaction from './models/Reaction.js';
import { logError } from './logger.js';


const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = 5000;
const SECRET_KEY = 'super_secret_key_change_in_production';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Associations
User.hasMany(Entry, { foreignKey: 'userId' });
Entry.belongsTo(User, { foreignKey: 'userId' });
User.belongsToMany(Badge, { through: 'UserBadges' });
Badge.belongsToMany(User, { through: 'UserBadges' });

// Social Associations
User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });
Group.hasMany(Message);
Message.belongsTo(Group);
User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Feedback, { foreignKey: 'userId' });
Feedback.belongsTo(User, { foreignKey: 'userId' });

// Real World Associations
User.hasMany(DailySnap, { foreignKey: 'userId' });
DailySnap.belongsTo(User, { foreignKey: 'userId' });
DailySnap.hasMany(Reaction);
Reaction.belongsTo(DailySnap);
User.hasMany(Reaction, { foreignKey: 'userId' });
Reaction.belongsTo(User, { foreignKey: 'userId' });


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
        console.log(`[AUTH] Registering user: ${username} (${email})`);
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email and password are required' });
        }

        const user = await User.create({ username, email, password });
        console.log(`[AUTH] User created: ${user.id}`);
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(`[AUTH] Registration failed: ${error.message}`);
        logError(error, 'User registration failed');
        res.status(500).json({ error: 'User registration failed', details: error.message });
    }
});

app.post('/api/auth/check-user', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: 'Username or email is required' });

        const user = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email: username }]
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'We couldn’t find an account with that username or email.' });
        }

        res.json({ message: 'User exists', username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});



app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Please enter username/email and password' });
        }

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: username }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Account not found' });
        }

        if (!(await user.validPassword(password))) {
            return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ 
            token, 
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                themePreference: user.themePreference,
                pfpUrl: user.pfpUrl
            }
        });
    } catch (error) {
        logError(error, 'Login failed');
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});


// --- RECOVERY ROUTES ---

app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        console.log(`[RECOVERY] Reset token for ${email}: ${resetToken}`); // Log to console for dev
        res.json({ message: 'Reset token generated (Check server console in dev mode)' });
    } catch (error) {
        logError(error, 'Forgot password failed');
        res.status(500).json({ error: 'Failed to initiate recovery' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        const user = await User.findOne({
            where: {
                email,
                resetToken: token,
                resetTokenExpiry: { [Op.gt]: new Date() }
            }
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        user.password = newPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        logError(error, 'Reset password failed');
        res.status(500).json({ error: 'Failed to reset password' });
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

app.post('/api/entries', authenticate, upload.fields([{ name: 'audio' }, { name: 'photo' }]), async (req, res) => {
    try {
        const { title, content, mood, location } = req.body;
        let audioData = null;
        let photoData = null;

        if (req.files?.audio) {
            audioData = zlib.gzipSync(req.files.audio[0].buffer);
        }
        if (req.files?.photo) {
            photoData = req.files.photo[0].buffer;
        }

        const entry = await Entry.create({
            title,
            content,
            mood,
            location: location ? JSON.parse(location) : null,
            userId: req.userId,
            audioData,
            photoData
        });

        // Streak Logic
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize
        const user = await User.findByPk(req.userId);

        const lastEntry = user.lastEntryDate ? new Date(user.lastEntryDate) : null;
        if (lastEntry) lastEntry.setHours(0, 0, 0, 0);

        let newStreak = user.currentStreak;

        if (lastEntry) {
            const diffTime = today.getTime() - lastEntry.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                newStreak += 1; // Consecutive
            } else if (diffDays > 1) {
                newStreak = 1; // Broken
            }
        } else {
            newStreak = 1; // First
        }

        user.currentStreak = newStreak;
        user.lastEntryDate = today;
        await user.save();

        // Award Badges
        const awardedBadges = [];
        if (newStreak === 3) awardedBadges.push('3 Day Streak');
        if (newStreak === 7) awardedBadges.push('7 Day Streak');
        if (newStreak === 30) awardedBadges.push('30 Day Streak');

        for (const badgeName of awardedBadges) {
            const badge = await Badge.findOne({ where: { name: badgeName } });
            if (badge) {
                const hasBadge = await user.hasBadge(badge);
                if (!hasBadge) {
                    await user.addBadge(badge);
                }
            }
        }

        res.json({ entry, streak: newStreak, badges: awardedBadges });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create entry' });
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

// --- SOCIAL ROUTES ---

app.post('/api/groups', authenticate, async (req, res) => {
    try {
        const { name, description } = req.body;
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const group = await Group.create({
            name,
            description,
            inviteCode,
            creatorId: req.userId
        });

        await group.addUser(req.userId, { through: { role: 'admin' } });
        res.json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create group' });
    }
});

app.post('/api/groups/join', authenticate, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const group = await Group.findOne({ where: { inviteCode } });

        if (!group) return res.status(404).json({ error: 'Group not found' });

        const hasJoined = await group.hasUser(req.userId);
        if (hasJoined) return res.status(400).json({ error: 'Already a member' });

        await group.addUser(req.userId);

        await Message.create({
            content: 'joined the group',
            isSystemMessage: true,
            GroupId: group.id,
            userId: req.userId
        });


        res.json({ message: 'Joined successfully', group });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join group' });
    }
});

app.get('/api/groups', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: Group
        });
        res.json(user.Groups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

app.get('/api/groups/:id', authenticate, async (req, res) => {
    try {
        const group = await Group.findByPk(req.params.id, {
            include: [
                {
                    model: Message,
                    include: { model: User, attributes: ['username'] }
                }
            ],
            order: [[Message, 'createdAt', 'ASC']]
        });

        const isMember = await group.hasUser(req.userId);
        if (!isMember) return res.status(403).json({ error: 'Not a member' });

        res.json(group);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch group details' });
    }
});

app.post('/api/groups/:id/messages', authenticate, async (req, res) => {
    try {
        const { content } = req.body;
        const msg = await Message.create({
            content,
            userId: req.userId,
            GroupId: req.params.id
        });


        const fullMsg = await Message.findByPk(msg.id, {
            include: { model: User, attributes: ['username'] }
        });

        res.json(fullMsg);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// --- SNAPS & REACTIONS ROUTES ---

app.get('/api/snaps', authenticate, async (req, res) => {
    try {
        const snaps = await DailySnap.findAll({
            include: [
                { model: User, attributes: ['username'] },
                {
                    model: Reaction,
                    include: { model: User, attributes: ['username'] }
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        res.json(snaps);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch snaps' });
    }
});

app.post('/api/snaps', authenticate, async (req, res) => {
    try {
        const { imageUrl, caption, song, location } = req.body;
        const snap = await DailySnap.create({
            imageUrl,
            caption,
            song,
            location,
            userId: req.userId
        });

        res.json(snap);
    } catch (error) {
        res.status(500).json({ error: 'Failed to post snap' });
    }
});

app.post('/api/snaps/:id/react', authenticate, async (req, res) => {
    try {
        const { emoji } = req.body;

        const reaction = await Reaction.create({
            emoji,
            userId: req.userId,
            dailySnapId: req.params.id
        });


        const fullRxn = await Reaction.findByPk(reaction.id, {
            include: { model: User, attributes: ['username'] }
        });

        res.json(fullRxn);
    } catch (error) {
        res.status(500).json({ error: 'Failed to react' });
    }
});

// --- SUPPORT ROUTES ---
app.post('/api/feedback', authenticate, async (req, res) => {
    try {
        const { content, type } = req.body;
        await Feedback.create({
            content,
            type,
            userId: req.userId
        });

        res.json({ message: 'Feedback received' });
    } catch (error) {
        logError(error, 'Feedback failed');
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

// --- SETTINGS & ACCOUNT MANAGEMENT ---

app.get('/api/user/settings', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        res.json({
            email: user.email,
            username: user.username,
            pfpUrl: user.pfpUrl,
            themePreference: user.themePreference,
            gamificationEnabled: user.gamificationEnabled,
            is2FAEnabled: user.is2FAEnabled,
            privacy: {
                showMediaToGroups: user.showMediaToGroups,
                showNotesToGroups: user.showNotesToGroups,
                allowActivityTracking: user.allowActivityTracking
            }
        });
    } catch (error) {
        logError(error, 'Fetch settings failed');
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.put('/api/user/settings', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        const { themePreference, gamificationEnabled, pfpUrl, privacy } = req.body;

        if (themePreference) user.themePreference = themePreference;
        if (gamificationEnabled !== undefined) user.gamificationEnabled = gamificationEnabled;
        if (pfpUrl !== undefined) user.pfpUrl = pfpUrl;
        if (privacy) {
            if (privacy.showMediaToGroups !== undefined) user.showMediaToGroups = privacy.showMediaToGroups;
            if (privacy.showNotesToGroups !== undefined) user.showNotesToGroups = privacy.showNotesToGroups;
            if (privacy.allowActivityTracking !== undefined) user.allowActivityTracking = privacy.allowActivityTracking;
        }

        await user.save();
        res.json({ message: 'Settings updated' });
    } catch (error) {
        logError(error, 'Update settings failed');
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

app.put('/api/user/password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.userId);

        if (!(await user.validPassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        logError(error, 'Update password failed');
        res.status(500).json({ error: 'Failed to update password' });
    }
});

app.delete('/api/user', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        // Cascading delete - entries, messages, reactions because of associations
        await user.destroy();
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        logError(error, 'Account deletion failed');
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    logError(err, `${req.method} ${req.url}`);
    res.status(500).json({ error: 'An internal server error occurred', details: err.message });
});


// Sync DB
sequelize.sync({ alter: true }).then(async () => {
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
