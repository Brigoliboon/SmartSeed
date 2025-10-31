import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET /api/monitoring/sites - fetch all geotagged monitoring sites
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT
        ms.*,
        sr.request_code,
        sr.planting_site_address,
        b.full_name as beneficiary_name
       FROM monitoring_sites ms
       LEFT JOIN seedling_requests sr ON ms.request_id = sr.id
       LEFT JOIN beneficiaries b ON sr.beneficiary_id = b.beneficiary_id
       WHERE ms.gps_latitude IS NOT NULL AND ms.gps_longitude IS NOT NULL
       ORDER BY ms.created_at DESC`
    );

    return NextResponse.json({ success: true, sites: result.rows });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sites' }, { status: 500 });
  }
}
