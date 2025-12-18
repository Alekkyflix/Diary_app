import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Message = sequelize.define('Message', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isSystemMessage: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

export default Message;
