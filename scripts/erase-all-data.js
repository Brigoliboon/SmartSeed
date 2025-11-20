const { Pool } = require('pg');
const readline = require('readline');

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'smartseed',
  password: '319722195',
  port: 5432,
});

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function eraseAllData() {
  let client;
  
  try {
    client = await pool.connect();
    console.log('✅ Connected to smartseed database');
    console.log('\n⚠️  WARNING: This will DELETE ALL DATA from the wildlings inventory database!');
    console.log('⚠️  This action CANNOT be undone!\n');
    
    // Prompt for confirmation
    rl.question('Are you sure you want to proceed? Type "YES" to confirm: ', async (answer) => {
      if (answer !== 'YES') {
        console.log('\n❌ Operation cancelled.');
        rl.close();
        client.release();
        await pool.end();
        return;
      }

      try {
        console.log('\n🗑️  Starting data deletion...\n');

        // Delete data in the correct order (respecting foreign key constraints)
        
        // 1. Delete daily task completions (depends on beds, tasks, and users)
        const completionsResult = await client.query('DELETE FROM daily_task_completions');
        console.log(`✅ Deleted ${completionsResult.rowCount} records from daily_task_completions`);

        // 2. Delete batch-bed assignments (depends on batches and beds)
        const assignmentsResult = await client.query('DELETE FROM batch_bed_assignments');
        console.log(`✅ Deleted ${assignmentsResult.rowCount} records from batch_bed_assignments`);

        // 3. Reset bed occupancy and delete beds (depends on locations and users)
        await client.query('UPDATE beds SET current_occupancy = 0');
        const bedsResult = await client.query('DELETE FROM beds');
        console.log(`✅ Deleted ${bedsResult.rowCount} records from beds`);

        // 4. Delete batches (no dependencies from other tables now)
        const batchesResult = await client.query('DELETE FROM batches');
        console.log(`✅ Deleted ${batchesResult.rowCount} records from batches`);

        // 5. Delete bed tasks (excluding default tasks if you want to keep them)
        // Uncomment the next line if you want to delete custom tasks only
        // const tasksResult = await client.query('DELETE FROM bed_tasks WHERE is_default = FALSE');
        
        // Or delete all tasks including defaults:
        const tasksResult = await client.query('DELETE FROM bed_tasks');
        console.log(`✅ Deleted ${tasksResult.rowCount} records from bed_tasks`);

        // 6. Delete locations (no dependencies from other tables now)
        const locationsResult = await client.query('DELETE FROM locations');
        console.log(`✅ Deleted ${locationsResult.rowCount} records from locations`);

        // 7. Delete users (no dependencies from other tables now)
        const usersResult = await client.query('DELETE FROM users');
        console.log(`✅ Deleted ${usersResult.rowCount} records from users`);

        // Reset sequences (auto-increment counters) to start from 1
        console.log('\n🔄 Resetting sequence counters...');
        await client.query('ALTER SEQUENCE batches_id_seq RESTART WITH 1');
        await client.query('ALTER SEQUENCE users_user_id_seq RESTART WITH 1');
        await client.query('ALTER SEQUENCE locations_location_id_seq RESTART WITH 1');
        await client.query('ALTER SEQUENCE beds_bed_id_seq RESTART WITH 1');
        await client.query('ALTER SEQUENCE batch_bed_assignments_assignment_id_seq RESTART WITH 1');
        await client.query('ALTER SEQUENCE bed_tasks_task_id_seq RESTART WITH 1');
        await client.query('ALTER SEQUENCE daily_task_completions_completion_id_seq RESTART WITH 1');
        console.log('✅ All sequences reset');

        // Verify all tables are empty
        console.log('\n📊 Verifying data deletion...\n');
        const verifyQuery = `
          SELECT 'users' as table_name, COUNT(*) as count FROM users
          UNION ALL
          SELECT 'locations', COUNT(*) FROM locations
          UNION ALL
          SELECT 'beds', COUNT(*) FROM beds
          UNION ALL
          SELECT 'batches', COUNT(*) FROM batches
          UNION ALL
          SELECT 'batch_bed_assignments', COUNT(*) FROM batch_bed_assignments
          UNION ALL
          SELECT 'bed_tasks', COUNT(*) FROM bed_tasks
          UNION ALL
          SELECT 'daily_task_completions', COUNT(*) FROM daily_task_completions
          ORDER BY table_name
        `;
        
        const verifyResult = await client.query(verifyQuery);
        console.log('Table counts after deletion:');
        console.table(verifyResult.rows);

        const totalRecords = verifyResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
        
        if (totalRecords === 0) {
          console.log('\n✅ SUCCESS: All data has been erased from the database!');
          console.log('ℹ️  The database schema and structure remain intact.');
        } else {
          console.log(`\n⚠️  Warning: ${totalRecords} records still remain in the database.`);
        }

      } catch (err) {
        console.error('\n❌ Error during data deletion:', err.message);
        console.error(err.stack);
      } finally {
        rl.close();
        client.release();
        await pool.end();
      }
    });

  } catch (err) {
    console.error('❌ Error connecting to database:', err.message);
    console.error(err.stack);
    rl.close();
    if (client) client.release();
    await pool.end();
  }
}

// Run the script
eraseAllData();
