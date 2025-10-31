const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'smartseed',
  password: '319722195',
  port: 5432,
});

async function checkData() {
  try {
    console.log('\n=== DATABASE CONTENT CHECK ===\n');
    
    // Check batches
    const batches = await pool.query('SELECT COUNT(*) FROM batches');
    console.log(`📦 Batches: ${batches.rows[0].count}`);
    
    // Check beds
    const beds = await pool.query('SELECT COUNT(*) FROM beds');
    console.log(`🛏️  Beds: ${beds.rows[0].count}`);
    
    // Check locations
    const locations = await pool.query('SELECT COUNT(*) FROM locations');
    console.log(`📍 Locations: ${locations.rows[0].count}`);
    
    // Check assignments
    const assignments = await pool.query('SELECT COUNT(*) FROM batch_bed_assignments');
    console.log(`🔗 Assignments: ${assignments.rows[0].count}`);
    
    // Check tasks
    const tasks = await pool.query('SELECT COUNT(*) FROM bed_tasks');
    console.log(`✅ Bed Tasks: ${tasks.rows[0].count}`);
    
    // Check task completions
    const completions = await pool.query('SELECT COUNT(*) FROM daily_task_completions');
    console.log(`📋 Task Completions: ${completions.rows[0].count}`);
    
    console.log('\n=== SAMPLE DATA ===\n');
    
    // Show batches
    const batchData = await pool.query('SELECT batch_id, wildlings_count, date_received FROM batches LIMIT 5');
    console.log('Batches:');
    batchData.rows.forEach(b => {
      console.log(`  - ${b.batch_id}: ${b.wildlings_count} wildlings (${b.date_received.toLocaleDateString()})`);
    });
    
    console.log('\nBeds with Capacity:');
    const bedData = await pool.query('SELECT bed_name, species_category, current_occupancy, capacity FROM beds LIMIT 5');
    bedData.rows.forEach(b => {
      const pct = b.capacity ? ((b.current_occupancy / b.capacity) * 100).toFixed(1) : 0;
      console.log(`  - ${b.bed_name} (${b.species_category}): ${b.current_occupancy}/${b.capacity} (${pct}%)`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkData();
