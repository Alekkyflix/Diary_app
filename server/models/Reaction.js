import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Reaction = sequelize.define('Reaction', {
    emoji: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

export default Reaction;
