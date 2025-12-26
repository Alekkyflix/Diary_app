import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Group = sequelize.define('Group', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    inviteCode: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

export default Group;
