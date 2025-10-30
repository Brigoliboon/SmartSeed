const bcrypt = require('bcryptjs');

async function testPassword() {
  const plainPassword = 'password123';
  const storedHash = '$2a$10$rKzDMOKKQJ8LhS9VEqxBJOU7EQ3YqJxV9xKhLZPXqGqYGzYgYqKYe';
  
  console.log('Testing password verification...');
  console.log('Plain password:', plainPassword);
  console.log('Stored hash:', storedHash);
  
  const match = await bcrypt.compare(plainPassword, storedHash);
  console.log('Password match:', match);
  
  // Also generate a fresh hash for comparison
  const newHash = await bcrypt.hash(plainPassword, 10);
  console.log('\nNew hash for same password:', newHash);
  
  const newMatch = await bcrypt.compare(plainPassword, newHash);
  console.log('New hash match:', newMatch);
}

testPassword();
