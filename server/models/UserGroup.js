import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const UserGroup = sequelize.define('UserGroup', {
    role: {
        type: DataTypes.STRING, // 'admin' or 'member'
        defaultValue: 'member'
    }
});

export default UserGroup;
