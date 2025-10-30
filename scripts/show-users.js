const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'smartseed',
  password: '319722195',
  port: 5432,
});

async function showUsers() {
  try {
    const result = await pool.query(
      'SELECT user_id, name, email, role FROM users ORDER BY user_id'
    );
    
    console.log('\n=== SMARTSEED LOGIN CREDENTIALS ===\n');
    
    result.rows.forEach(user => {
      console.log(`👤 ${user.name} (${user.role})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: password123`);
      console.log(`   User ID: ${user.user_id}\n`);
    });
    
    console.log('Note: All users have the same password: "password123"');
    console.log('Change these passwords in production!\n');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

showUsers();
