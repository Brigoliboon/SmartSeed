import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET /api/locations - Fetch all locations
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM locations ORDER BY location_name'
    );
    
    return NextResponse.json({
      success: true,
      locations: result.rows
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// POST /api/locations - Create new location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location_name, description } = body;

    if (!location_name) {
      return NextResponse.json(
        { success: false, error: 'Location name is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO locations (location_name, description) 
       VALUES ($1, $2) 
       RETURNING *`,
      [location_name, description || null]
    );

    return NextResponse.json({
      success: true,
      location: result.rows[0],
      message: 'Location created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating location:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A location with this name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create location' },
      { status: 500 }
    );
  }
}
