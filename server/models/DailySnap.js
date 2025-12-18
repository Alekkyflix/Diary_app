import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const DailySnap = sequelize.define('DailySnap', {
    imageUrl: {
        type: DataTypes.TEXT, // Using TEXT for base64 string or URL
        allowNull: false
    },
    caption: {
        type: DataTypes.STRING,
        allowNull: true
    },
    song: {
        type: DataTypes.JSON, // { title, artist }
        allowNull: true
    },
    location: {
        type: DataTypes.JSON, // { name, lat, lng }
        allowNull: true
    }
});

export default DailySnap;
