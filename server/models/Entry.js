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
    }
});

export default Entry;
