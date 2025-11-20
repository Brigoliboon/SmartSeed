import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET /api/seedling-requests/:id - fetch single request with species
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const res = await pool.query(
      `SELECT sr.*, b.full_name as beneficiary_name, b.contact_number, b.email, b.address
       FROM seedling_requests sr
       LEFT JOIN beneficiaries b ON sr.beneficiary_id = b.beneficiary_id
       WHERE sr.id = $1`,
      [id]
    );

    if (!res.rows.length) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const req = res.rows[0];
    const sp = await pool.query(`SELECT species_name, quantity FROM request_species WHERE request_id = $1`, [id]);
    req.species = sp.rows;

    return NextResponse.json({ success: true, request: req });
  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

// PATCH /api/seedling-requests/:id - update status/review
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { action, review_notes, scheduled_release_date } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action required' }, { status: 400 });
    }

    // action = 'approve' or 'reject'
    if (action === 'approve') {
      const q = `UPDATE seedling_requests SET status='approved', review_notes=$1, scheduled_release_date=$2 WHERE id=$3 RETURNING *`;
      const res = await pool.query(q, [review_notes || null, scheduled_release_date || null, id]);
      return NextResponse.json({ success: true, request: res.rows[0] });
    }

    if (action === 'reject') {
      const q = `UPDATE seedling_requests SET status='rejected', review_notes=$1 WHERE id=$2 RETURNING *`;
      const res = await pool.query(q, [review_notes || null, id]);
      return NextResponse.json({ success: true, request: res.rows[0] });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}
