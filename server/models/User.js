import { DataTypes } from 'sequelize';
import sequelize from '../database.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true // Nullable for social login users
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    githubId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    microsoftId: {
        type: DataTypes.STRING,
        allowNull: true
    },


    currentStreak: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastEntryDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    pfpUrl: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is2FAEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    themePreference: {
        type: DataTypes.STRING,
        defaultValue: 'dark'
    },
    gamificationEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    // Privacy Settings
    showMediaToGroups: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    showNotesToGroups: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    allowActivityTracking: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    // Recovery
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true
    },
    recoveryBackupCodes: {
        type: DataTypes.TEXT, // Stringified JSON
        allowNull: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    appLockPin: {
        type: DataTypes.STRING, // Hashed PIN
        allowNull: true
    }
});

// Hooks for password hashing
User.beforeCreate(async (user) => {
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

User.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default User;
