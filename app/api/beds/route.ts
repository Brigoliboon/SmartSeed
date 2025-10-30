import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET /api/beds - Fetch all beds with details (optionally filter by assigned user)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assignedTo = searchParams.get('assignedTo');
    const qrCode = searchParams.get('qrCode');

    let query = `
      SELECT 
        b.bed_id,
        b.bed_name,
        l.location_name,
        b.species_category,
        b.qr_code,
        u.name as person_in_charge_name,
        u.user_id as in_charge_id,
        b.capacity,
        b.current_occupancy,
        ROUND((b.current_occupancy::DECIMAL / NULLIF(b.capacity, 0) * 100), 2) as occupancy_percentage,
        b.notes,
        b.created_at,
        b.updated_at,
        -- Check if all tasks completed today
        (
          SELECT COUNT(*) = (SELECT COUNT(*) FROM bed_tasks WHERE is_default = TRUE)
          FROM daily_task_completions dtc
          WHERE dtc.bed_id = b.bed_id
          AND dtc.completion_date = CURRENT_DATE
        ) as tasks_completed_today
      FROM beds b
      LEFT JOIN locations l ON b.location_id = l.location_id
      LEFT JOIN users u ON b.in_charge = u.user_id
    `;

    const params: any[] = [];
    const conditions: string[] = [];
    
    if (assignedTo) {
      conditions.push(`b.in_charge = $${params.length + 1}`);
      params.push(parseInt(assignedTo));
    }

    if (qrCode) {
      conditions.push(`b.qr_code = $${params.length + 1}`);
      params.push(qrCode);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY b.bed_id`;

    const result = await pool.query(query, params);
    
    return NextResponse.json({
      success: true,
      beds: result.rows
    });
  } catch (error) {
    console.error('Error fetching beds:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch beds' },
      { status: 500 }
    );
  }
}

// POST /api/beds - Create new bed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bed_name, location_id, species_category, in_charge, capacity, notes } = body;

    // Validate required fields
    if (!bed_name || !location_id || !species_category) {
      return NextResponse.json(
        { success: false, error: 'Bed name, location, and species category are required' },
        { status: 400 }
      );
    }

    // Validate species category
    const validCategories = ['Fruit Tree', 'Forestry', 'Ornamental'];
    if (!validCategories.includes(species_category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid species category' },
        { status: 400 }
      );
    }

    // Insert new bed
    const result = await pool.query(
      `INSERT INTO beds 
        (bed_name, location_id, species_category, in_charge, capacity, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [bed_name, location_id, species_category, in_charge || null, capacity || null, notes || null]
    );

    return NextResponse.json({
      success: true,
      bed: result.rows[0],
      message: 'Bed created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating bed:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A bed with this name already exists in this location' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create bed' },
      { status: 500 }
    );
  }
}
