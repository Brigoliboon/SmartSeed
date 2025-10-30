import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET /api/tasks/bed/:bedId - Get tasks for a specific bed (by QR code or bed_id)
export async function GET(
  request: NextRequest,
  { params }: { params: { bedId: string } }
) {
  try {
    const bedIdentifier = params.bedId;

    // First, find the bed (could be bed_id or qr_code)
    const bedResult = await pool.query(
      `SELECT b.*, l.location_name, u.name as person_in_charge_name
       FROM beds b
       LEFT JOIN locations l ON b.location_id = l.location_id
       LEFT JOIN users u ON b.in_charge = u.user_id
       WHERE b.bed_id = $1 OR b.qr_code = $1`,
      [bedIdentifier]
    );

    if (bedResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Bed not found' },
        { status: 404 }
      );
    }

    const bed = bedResult.rows[0];

    // Get all default tasks
    const tasksResult = await pool.query(
      'SELECT * FROM bed_tasks WHERE is_default = TRUE ORDER BY task_id'
    );

    // Get today's completions for this bed
    const completionsResult = await pool.query(
      `SELECT task_id, completed_by, completion_time, photo_url, notes
       FROM daily_task_completions
       WHERE bed_id = $1 AND completion_date = CURRENT_DATE`,
      [bed.bed_id]
    );

    const completedTaskIds = completionsResult.rows.map(c => c.task_id);

    // Combine tasks with completion status
    const tasksWithStatus = tasksResult.rows.map(task => ({
      ...task,
      is_completed: completedTaskIds.includes(task.task_id),
      completion_data: completionsResult.rows.find(c => c.task_id === task.task_id) || null
    }));

    return NextResponse.json({
      success: true,
      bed: bed,
      tasks: tasksWithStatus,
      all_completed: tasksWithStatus.every(t => t.is_completed)
    });

  } catch (error) {
    console.error('Error fetching bed tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bed tasks' },
      { status: 500 }
    );
  }
}
