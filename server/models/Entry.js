import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Entry = sequelize.define('Entry', {
    title: {
        type: DataTypes.STRING,
        defaultValue: 'Untitled'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    mood: {
        type: DataTypes.STRING,
        allowNull: true
    },
    audioData: {
        type: DataTypes.BLOB('long'), // Store audio as binary
        allowNull: true
    },
    photoData: {
        type: DataTypes.BLOB('long'), // Store photo as binary
        allowNull: true
    },
    location: {
        type: DataTypes.JSON, // Store { lat, lng, name }
        allowNull: true
    }
});

export default Entry;
