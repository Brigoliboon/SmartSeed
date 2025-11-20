const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'smartseed',
  password: '319722195',
  port: 5432,
});

async function addDummyBeds() {
  const client = await pool.connect();
  
  try {
    console.log('\n=== ADDING DUMMY BED DATA ===\n');
    
    await client.query('BEGIN');
    
    // 1. Create locations if they don't exist
    console.log('📍 Creating locations...');
    const locations = [
      { name: 'North Section', description: 'Main nursery area in the north section' },
      { name: 'South Section', description: 'Secondary nursery area in the south' },
      { name: 'East Greenhouse', description: 'Covered greenhouse area' },
      { name: 'West Field', description: 'Open field area for hardy species' }
    ];
    
    const locationIds = [];
    for (const loc of locations) {
      const result = await client.query(
        `INSERT INTO locations (location_name, description) 
         VALUES ($1, $2) 
         ON CONFLICT (location_name) DO UPDATE SET location_name = EXCLUDED.location_name
         RETURNING location_id`,
        [loc.name, loc.description]
      );
      locationIds.push(result.rows[0].location_id);
      console.log(`  ✓ ${loc.name}`);
    }
    
    // 2. Get or create field workers
    console.log('\n👥 Checking for users...');
    let users = await client.query(`SELECT user_id, name FROM users LIMIT 3`);
    
    if (users.rows.length === 0) {
      console.log('  No users found, creating dummy users...');
      // Simple hash for demo purposes (in production, use proper bcrypt)
      const crypto = require('crypto');
      const hashedPassword = crypto.createHash('sha256').update('password123').digest('hex');
      
      const dummyUsers = [
        { name: 'Juan Dela Cruz', email: 'juan@smartseed.com' },
        { name: 'Maria Santos', email: 'maria@smartseed.com' },
        { name: 'Pedro Reyes', email: 'pedro@smartseed.com' }
      ];
      
      const userIds = [];
      for (const user of dummyUsers) {
        const result = await client.query(
          `INSERT INTO users (name, email, password_hash, role) 
           VALUES ($1, $2, $3, 'field_worker') 
           ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
           RETURNING user_id`,
          [user.name, user.email, hashedPassword]
        );
        userIds.push(result.rows[0].user_id);
        console.log(`  ✓ ${user.name}`);
      }
      users = { rows: userIds.map((id, i) => ({ user_id: id, name: dummyUsers[i].name })) };
    } else {
      console.log(`  ✓ Found ${users.rows.length} users`);
    }
    
    // 3. Create beds
    console.log('\n🛏️  Creating plant beds...');
    const categories = ['Fruit Tree', 'Forestry', 'Ornamental'];
    const beds = [];
    
    // Generate beds for each location
    let bedCounter = 1;
    for (let locIndex = 0; locIndex < locationIds.length; locIndex++) {
      const locationId = locationIds[locIndex];
      const locationName = locations[locIndex].name;
      
      // Create 3-5 beds per location
      const bedsPerLocation = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < bedsPerLocation; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const capacity = 100 + Math.floor(Math.random() * 400); // 100-500
        const occupancy = Math.floor(Math.random() * capacity * 0.8); // 0-80% full
        const bedName = `BED-${String(bedCounter).padStart(3, '0')}`;
        const qrCode = `QR-${bedName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const inCharge = users.rows[Math.floor(Math.random() * users.rows.length)].user_id;
        
        const notes = [
          'Recently established bed, monitoring growth',
          'Good drainage, regular watering schedule',
          'Requires shade netting during hot season',
          'High quality soil mix, optimal conditions',
          null
        ][Math.floor(Math.random() * 5)];
        
        beds.push({
          bedName,
          locationId,
          category,
          inCharge,
          capacity,
          occupancy,
          qrCode,
          notes,
          locationName
        });
        
        bedCounter++;
      }
    }
    
    // Insert all beds
    for (const bed of beds) {
      await client.query(
        `INSERT INTO beds (bed_name, location_id, species_category, in_charge, capacity, current_occupancy, qr_code, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [bed.bedName, bed.locationId, bed.category, bed.inCharge, bed.capacity, bed.occupancy, bed.qrCode, bed.notes]
      );
      
      const occupancyPct = ((bed.occupancy / bed.capacity) * 100).toFixed(0);
      console.log(`  ✓ ${bed.bedName} (${bed.locationName})`);
      console.log(`    Category: ${bed.category} | Capacity: ${bed.capacity} | Occupancy: ${bed.occupancy} (${occupancyPct}%)`);
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ SUCCESS!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Locations: ${locationIds.length}`);
    console.log(`   - Field Workers: ${users.rows.length}`);
    console.log(`   - Beds Created: ${beds.length}`);
    
    // Show final counts
    const totalBeds = await client.query('SELECT COUNT(*) FROM beds');
    const totalLocations = await client.query('SELECT COUNT(*) FROM locations');
    console.log(`\n📈 Total in Database:`);
    console.log(`   - Total Locations: ${totalLocations.rows[0].count}`);
    console.log(`   - Total Beds: ${totalBeds.rows[0].count}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error adding dummy beds:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

addDummyBeds();
