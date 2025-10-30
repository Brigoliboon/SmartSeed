import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// POST /api/tasks/complete - Mark a task as completed
export async function POST(request: NextRequest) {
  try {
    const { bed_id, task_id, completed_by, photo_url, notes, gps_latitude, gps_longitude } = await request.json();

    // Validate required fields
    if (!bed_id || !task_id || !completed_by) {
      return NextResponse.json(
        { success: false, error: 'Bed ID, task ID, and user ID are required' },
        { status: 400 }
      );
    }

    // Insert or update completion
    const result = await pool.query(
      `INSERT INTO daily_task_completions 
        (bed_id, task_id, completed_by, photo_url, notes, gps_latitude, gps_longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (bed_id, task_id, completion_date) 
       DO UPDATE SET
         completed_by = EXCLUDED.completed_by,
         completion_time = CURRENT_TIMESTAMP,
         photo_url = EXCLUDED.photo_url,
         notes = EXCLUDED.notes,
         gps_latitude = EXCLUDED.gps_latitude,
         gps_longitude = EXCLUDED.gps_longitude
       RETURNING *`,
      [bed_id, task_id, completed_by, photo_url || null, notes || null, gps_latitude || null, gps_longitude || null]
    );

    return NextResponse.json({
      success: true,
      completion: result.rows[0],
      message: 'Task marked as completed'
    });

  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/complete - Unmark a task
export async function DELETE(request: NextRequest) {
  try {
    const { bed_id, task_id } = await request.json();

    if (!bed_id || !task_id) {
      return NextResponse.json(
        { success: false, error: 'Bed ID and task ID are required' },
        { status: 400 }
      );
    }

    await pool.query(
      `DELETE FROM daily_task_completions
       WHERE bed_id = $1 AND task_id = $2 AND completion_date = CURRENT_DATE`,
      [bed_id, task_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Task unmarked'
    });

  } catch (error) {
    console.error('Error unmarking task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unmark task' },
      { status: 500 }
    );
  }
}
