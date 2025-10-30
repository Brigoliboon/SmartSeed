import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET /api/users - Fetch all users
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT user_id, name, email, role, phone, created_at FROM users ORDER BY name'
    );
    
    return NextResponse.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// GET /api/users?role=field_worker - Fetch users by role
export async function GET_BY_ROLE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let query = 'SELECT user_id, name, email, role, phone, created_at FROM users';
    const params: any[] = [];

    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    
    return NextResponse.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
