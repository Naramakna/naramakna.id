const bcrypt = require('bcryptjs');

// Users data with their new passwords
const users = [
    {
        email: 'tansah_rahmatullah@uninus.ac.id',
        name: 'Tansah Rahmatullah',
        password: 'Narmak3'
    },
    {
        email: 'waskawarta@uninus.ac.id', 
        name: 'Waska Warta',
        password: 'narmak1'
    },
    {
        email: 'Yosal.iriantara@gmail.com',
        name: 'Yosal Iriantara', 
        password: 'Narmak2'
    }
];

async function hashPasswords() {
    console.log('🔐 Hashing passwords...\n');
    
    for (const user of users) {
        try {
            // Hash password with bcrypt (salt rounds: 12)
            const hashedPassword = await bcrypt.hash(user.password, 12);
            
            console.log(`✅ ${user.name} (${user.email})`);
            console.log(`   Password: ${user.password}`);
            console.log(`   Hashed: ${hashedPassword}`);
            console.log(`   SQL: UPDATE users SET password = '${hashedPassword}' WHERE email = '${user.email}';`);
            console.log('');
        } catch (error) {
            console.error(`❌ Error hashing password for ${user.name}:`, error);
        }
    }
}

hashPasswords().catch(console.error);