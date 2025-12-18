import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Feedback = sequelize.define('Feedback', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('bug', 'feature', 'general'),
        defaultValue: 'general'
    }
});

export default Feedback;
