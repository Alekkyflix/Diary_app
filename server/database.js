import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
    dialectOptions: {
        // Disable FK checks to allow recursive table drops/syncs during dev
        // This is risky for prod but fixes the "FOREIGN KEY constraint failed" on sync({ alter: true })
        foreign_keys: false
    }
});

export default sequelize;
