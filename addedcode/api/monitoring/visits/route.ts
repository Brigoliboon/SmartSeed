import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET /api/monitoring/visits - fetch all monitoring visits
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT
        mv.*,
        ms.site_id,
        ms.request_id,
        sr.request_code,
        sr.planting_site_address,
        b.full_name as beneficiary_name,
        b.contact_number
       FROM monitoring_visits mv
       LEFT JOIN monitoring_sites ms ON mv.site_id = ms.site_id
       LEFT JOIN seedling_requests sr ON ms.request_id = sr.id
       LEFT JOIN beneficiaries b ON sr.beneficiary_id = b.beneficiary_id
       ORDER BY mv.scheduled_date DESC, mv.created_at DESC`
    );

    return NextResponse.json({ success: true, visits: result.rows });
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch visits' }, { status: 500 });
  }
}

// POST /api/monitoring/visits - schedule a monitoring visit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { request_id, scheduled_date } = body;

    if (!request_id || !scheduled_date) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    // Ensure monitoring site exists for this request (create simple entry)
    const siteRes = await pool.query(`SELECT site_id FROM monitoring_sites WHERE request_id = $1`, [request_id]);
    let site_id = null;
    if (siteRes.rows.length) {
      site_id = siteRes.rows[0].site_id;
    } else {
      const createSite = await pool.query(`INSERT INTO monitoring_sites (request_id) VALUES ($1) RETURNING site_id`, [request_id]);
      site_id = createSite.rows[0].site_id;
    }

    const res = await pool.query(
      `INSERT INTO monitoring_visits (site_id, scheduled_date, attempted_messages, beneficiary_confirmed) VALUES ($1,$2,$3,$4) RETURNING *`,
      [site_id, scheduled_date, 0, false]
    );

    return NextResponse.json({ success: true, visit: res.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error scheduling visit:', error);
    return NextResponse.json({ success: false, error: 'Failed to schedule' }, { status: 500 });
  }
}
