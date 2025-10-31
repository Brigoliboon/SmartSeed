import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// POST /api/sms - log/send SMS (simulation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to_number, message_text, attempt } = body;

    if (!to_number || !message_text) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const res = await pool.query(
      `INSERT INTO sms_messages (to_number, message_text, status, attempt) VALUES ($1,$2,$3,$4) RETURNING *`,
      [to_number, message_text, 'sent', attempt || 1]
    );

    return NextResponse.json({ success: true, sms: res.rows[0] });
  } catch (error) {
    console.error('Error logging SMS:', error);
    return NextResponse.json({ success: false, error: 'Failed to log sms' }, { status: 500 });
  }
}
