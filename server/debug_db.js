import sequelize from './database.js';
import User from './models/User.js';

async function main() {
    try {
        const users = await User.findAll();
        console.log('--- USERS IN DATABASE ---');
        users.forEach(u => {
            console.log(`ID: ${u.id} | Username: "${u.username}" | Email: "${u.email}"`);
        });
        console.log('-------------------------');
    } catch (err) {
        console.error('Error debugging DB:', err);
    } finally {
        process.exit();
    }
}

main();
