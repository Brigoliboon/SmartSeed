import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// PATCH /api/monitoring/visits/:id - update visit details
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const {
      attempted_messages,
      beneficiary_confirmed,
      visit_date,
      result,
      notes,
      blacklisted,
      gps_latitude,
      gps_longitude
    } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (attempted_messages !== undefined) {
      updates.push(`attempted_messages = $${paramCount++}`);
      values.push(attempted_messages);
    }
    if (beneficiary_confirmed !== undefined) {
      updates.push(`beneficiary_confirmed = $${paramCount++}`);
      values.push(beneficiary_confirmed);
    }
    if (visit_date !== undefined) {
      updates.push(`visit_date = $${paramCount++}`);
      values.push(visit_date);
    }
    if (result !== undefined) {
      updates.push(`result = $${paramCount++}`);
      values.push(result);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }
    if (blacklisted !== undefined) {
      updates.push(`blacklisted = $${paramCount++}`);
      values.push(blacklisted);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE monitoring_visits SET ${updates.join(', ')} WHERE visit_id = $${paramCount} RETURNING *`;

    const res = await pool.query(query, values);

    if (!res.rows.length) {
      return NextResponse.json({ success: false, error: 'Visit not found' }, { status: 404 });
    }

    const visit = res.rows[0];

    // If geo-location provided and result is successful, update the monitoring site
    if (result === 'planted_successful' && gps_latitude && gps_longitude) {
      await pool.query(
        `UPDATE monitoring_sites
         SET gps_latitude = $1, gps_longitude = $2
         WHERE site_id = $3`,
        [gps_latitude, gps_longitude, visit.site_id]
      );
    }

    // If blacklisted, add to blacklist table
    if (blacklisted && visit.site_id) {
      const siteInfo = await pool.query(
        `SELECT ms.request_id, sr.beneficiary_id
         FROM monitoring_sites ms
         JOIN seedling_requests sr ON ms.request_id = sr.id
         WHERE ms.site_id = $1`,
        [visit.site_id]
      );

      if (siteInfo.rows.length && siteInfo.rows[0].beneficiary_id) {
        await pool.query(
          `INSERT INTO blacklist (beneficiary_id, reason, active)
           VALUES ($1, $2, TRUE)
           ON CONFLICT DO NOTHING`,
          [siteInfo.rows[0].beneficiary_id, notes || 'Seedlings not planted as per site visit']
        );
      }
    }

    return NextResponse.json({ success: true, visit: res.rows[0] });
  } catch (error) {
    console.error('Error updating visit:', error);
    return NextResponse.json({ success: false, error: 'Failed to update visit' }, { status: 500 });
  }
}
