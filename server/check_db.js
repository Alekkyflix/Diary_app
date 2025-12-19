import User from './models/User.js';
import sequelize from './database.js';

async function checkUsers() {
    try {
        await sequelize.authenticate();
        const users = await User.findAll();
        console.log('--- USERS IN DB ---');
        console.log(JSON.stringify(users, null, 2));
        console.log('-------------------');
        process.exit(0);
    } catch (err) {
        console.error('Error checking users:', err);
        process.exit(1);
    }
}

checkUsers();
