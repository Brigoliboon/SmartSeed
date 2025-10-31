const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // Connect to default database first
  password: '319722195',
  port: 5432,
});

async function setupDatabase() {
  let client;
  
  try {
    client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'Smartseed'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('📦 Creating Smartseed database...');
      await client.query('CREATE DATABASE Smartseed');
      console.log('✅ Database created');
    } else {
      console.log('✅ Database already exists');
    }

    client.release();

    // Connect to Smartseed database
    const SmartseedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'Smartseed',
      password: '319722195',
      port: 5432,
    });

    const SmartseedClient = await SmartseedPool.connect();

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Executing schema...');
    await SmartseedClient.query(schemaSql);
    console.log('✅ Schema created successfully');

    // Verify setup
    const result = await SmartseedClient.query('SELECT COUNT(*) FROM batches');
    console.log(`✅ Database setup complete! Found ${result.rows[0].count} sample batches.`);

    SmartseedClient.release();
    await SmartseedPool.end();
    await pool.end();

    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup error:', error);
    if (client) client.release();
    await pool.end();
    process.exit(1);
  }
}

setupDatabase();
