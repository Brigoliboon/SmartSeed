import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET /api/releases - fetch all releases
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT r.*, sr.request_code, b.full_name as beneficiary_name, u.name as released_by_name
       FROM releases r
       LEFT JOIN seedling_requests sr ON r.request_id = sr.id
       LEFT JOIN beneficiaries b ON sr.beneficiary_id = b.beneficiary_id
       LEFT JOIN users u ON r.released_by = u.user_id
       ORDER BY r.release_date DESC`
    );

    return NextResponse.json({ success: true, releases: result.rows });
  } catch (error) {
    console.error('Error fetching releases:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch releases' }, { status: 500 });
  }
}

// POST /api/releases - create new release/distribution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { request_id, released_by, quantity_released, notes, release_date } = body;

    if (!request_id || !quantity_released) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Verify request is approved
    const reqCheck = await pool.query(
      `SELECT status FROM seedling_requests WHERE id = $1`,
      [request_id]
    );

    if (!reqCheck.rows.length) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    if (reqCheck.rows[0].status !== 'approved') {
      return NextResponse.json({ success: false, error: 'Request must be approved before releasing' }, { status: 400 });
    }

    const res = await pool.query(
      `INSERT INTO releases (request_id, released_by, quantity_released, notes, release_date)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP))
       RETURNING *`,
      [request_id, released_by || null, quantity_released, notes || null, release_date || null]
    );

    return NextResponse.json({ success: true, release: res.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating release:', error);
    return NextResponse.json({ success: false, error: 'Failed to create release' }, { status: 500 });
  }
}
