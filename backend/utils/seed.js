const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  const password = await bcrypt.hash('password123', 10);
  console.log('Hashed password for seed:', password);

  const users = [
    ['Admin User', 'admin@support.com', 'ADMIN'],
    ['Agent Smith', 'agent@support.com', 'SUPPORT_AGENT'],
    ['Agent Johnson', 'agent2@support.com', 'SUPPORT_AGENT'],
    ['John Customer', 'customer@support.com', 'CUSTOMER'],
    ['Jane Customer', 'customer2@support.com', 'CUSTOMER'],
  ];

  for (const [name, email, role] of users) {
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length === 0) {
      await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, role]
      );
      console.log(`Created user: ${email}`);
    }
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
