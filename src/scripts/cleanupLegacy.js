const { sequelize } = require('../models');

async function cleanup() {
    try {
        console.log('Starting cleanup of legacy tables...');
        await sequelize.authenticate();

        // Disable foreign key checks to allow dropping tables in any order
        await sequelize.query('PRAGMA foreign_keys = OFF;');

        const legacyTables = [
            'Courses', 'Users', 'Notes', 'Attachments', 'Shares', 'FriendRequests', 'UserFriends'
        ];

        for (const table of legacyTables) {
            console.log(`Dropping table ${table}...`);
            await sequelize.query(`DROP TABLE IF EXISTS ${table};`);
        }

        await sequelize.query('PRAGMA foreign_keys = ON;');
        console.log('Legacy tables dropped successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error during cleanup:', err);
        process.exit(1);
    }
}

cleanup();
