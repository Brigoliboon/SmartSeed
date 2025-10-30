const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'smartseed',
  password: '319722195',
  port: 5432,
});

async function fixPasswords() {
  try {
    const plainPassword = 'password123';
    
    // Generate correct bcrypt hash
    const correctHash = await bcrypt.hash(plainPassword, 10);
    console.log('Generated hash for "password123":', correctHash);
    
    // Update all users with the correct hash
    await pool.query(
      'UPDATE users SET password_hash = $1',
      [correctHash]
    );
    
    console.log('\n✅ All user passwords updated successfully!');
    
    // Verify by attempting login
    const result = await pool.query(
      'SELECT user_id, name, email, password_hash FROM users ORDER BY user_id'
    );
    
    console.log('\n=== Testing password verification for each user ===\n');
    
    for (const user of result.rows) {
      const match = await bcrypt.compare(plainPassword, user.password_hash);
      console.log(`${match ? '✅' : '❌'} ${user.name} (${user.email})`);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

fixPasswords();
