import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Badge = sequelize.define('Badge', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING, // Store Lucide icon name or emoji
        allowNull: false
    },
    criteria: {
        type: DataTypes.STRING, // e.g., 'streak:7'
        allowNull: false
    }
});

export default Badge;
