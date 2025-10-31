import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET /api/seedling-requests - Fetch all requests
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT sr.*, b.full_name as beneficiary_name, b.contact_number, b.email, b.address
       FROM seedling_requests sr
       LEFT JOIN beneficiaries b ON sr.beneficiary_id = b.beneficiary_id
       ORDER BY sr.date_submitted DESC`
    );

    // Fetch species per request
    const reqIds = result.rows.map((r: any) => r.id);
    let speciesMap: Record<number, any[]> = {};
    if (reqIds.length) {
      const sp = await pool.query(
        `SELECT request_id, species_name, quantity FROM request_species WHERE request_id = ANY($1::int[])`,
        [reqIds]
      );
      sp.rows.forEach((row: any) => {
        speciesMap[row.request_id] = speciesMap[row.request_id] || [];
        speciesMap[row.request_id].push({ species_name: row.species_name, quantity: row.quantity });
      });
    }

    const requests = result.rows.map((r: any) => ({
      ...r,
      species: speciesMap[r.id] || []
    }));

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching seedling requests:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST /api/seedling-requests - Create new request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { beneficiary, planting_site_address, hectarage, species, submitted_by } = body;

    if (!beneficiary || !planting_site_address || !hectarage) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Insert beneficiary (simple approach)
    const benRes = await pool.query(
      `INSERT INTO beneficiaries (full_name, address, contact_number, email) VALUES ($1,$2,$3,$4) RETURNING beneficiary_id`,
      [beneficiary.full_name, beneficiary.address || null, beneficiary.contact_number || null, beneficiary.email || null]
    );

    const beneficiary_id = benRes.rows[0].beneficiary_id;

    // Compute total quantity if species array provided
    let total_quantity = 0;
    if (Array.isArray(species) && species.length) {
      total_quantity = species.reduce((s: number, it: any) => s + (Number(it.quantity) || 0), 0);
    }

    const reqRes = await pool.query(
      `INSERT INTO seedling_requests (beneficiary_id, planting_site_address, hectarage, total_quantity, submitted_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [beneficiary_id, planting_site_address, hectarage, total_quantity, submitted_by || null]
    );

    const requestId = reqRes.rows[0].id;

    // Insert species
    if (Array.isArray(species) && species.length) {
      const insertPromises = species.map((sp: any) => {
        return pool.query(
          `INSERT INTO request_species (request_id, species_name, quantity) VALUES ($1,$2,$3)`,
          [requestId, sp.species_name, sp.quantity]
        );
      });
      await Promise.all(insertPromises);
    }

    return NextResponse.json({ success: true, request: reqRes.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating seedling request:', error);
    return NextResponse.json({ success: false, error: 'Failed to create request' }, { status: 500 });
  }
}
