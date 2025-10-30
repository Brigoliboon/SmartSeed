import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET /api/batches - Fetch all batches
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM batches ORDER BY date_received DESC'
    );
    
    return NextResponse.json({
      success: true,
      batches: result.rows
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

// POST /api/batches - Create new batch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source_location, wildlings_count, notes, person_in_charge, photo_url } = body;

    // Validate required fields
    if (!source_location || !wildlings_count) {
      return NextResponse.json(
        { success: false, error: 'Source location and wildlings count are required' },
        { status: 400 }
      );
    }

    // Generate batch_id
    const batchIdResult = await pool.query('SELECT generate_batch_id() as batch_id');
    const batch_id = batchIdResult.rows[0].batch_id;

    // Insert new batch
    const result = await pool.query(
      `INSERT INTO batches 
        (batch_id, source_location, wildlings_count, notes, person_in_charge, photo_url, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [batch_id, source_location, wildlings_count, notes || null, person_in_charge || null, photo_url || null, 'received']
    );

    return NextResponse.json({
      success: true,
      batch: result.rows[0],
      message: 'Batch created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}
