import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // 1. Plant Inventory Growth Over Time (Last 30 days)
    const growthQuery = `
      SELECT 
        DATE(date_received) as date,
        SUM(wildlings_count) OVER (ORDER BY DATE(date_received)) as cumulative_plants
      FROM batches
      WHERE date_received >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY date
    `;
    const growthResult = await pool.query(growthQuery);

    // Fill in missing dates with previous value
    const growthData = [];
    const today = new Date();
    let lastCount = 0;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dataPoint = growthResult.rows.find(r => r.date.toISOString().split('T')[0] === dateStr);
      if (dataPoint) {
        lastCount = parseInt(dataPoint.cumulative_plants);
      }
      
      growthData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        plants: lastCount
      });
    }

    // 2. Species Distribution by Category
    const speciesQuery = `
      SELECT 
        b.species_category as name,
        COALESCE(SUM(bba.quantity_assigned), 0) as value
      FROM beds b
      LEFT JOIN batch_bed_assignments bba ON b.bed_id = bba.bed_id
      GROUP BY b.species_category
      ORDER BY value DESC
    `;
    const speciesResult = await pool.query(speciesQuery);
    
    const colorMap: { [key: string]: string } = {
      'Forestry': '#22c55e',
      'Fruit Tree': '#f97316',
      'Ornamental': '#a855f7'
    };
    
    const speciesDistribution = speciesResult.rows.map(row => ({
      name: row.name,
      value: parseInt(row.value),
      color: colorMap[row.name] || '#6366f1'
    }));

    // 3. Bed Capacity Utilization
    const capacityQuery = `
      SELECT 
        b.bed_name as bed,
        b.current_occupancy as current,
        b.capacity,
        ROUND((b.current_occupancy::DECIMAL / NULLIF(b.capacity, 0) * 100), 2) as percentage
      FROM beds b
      WHERE b.capacity IS NOT NULL
      ORDER BY percentage DESC
      LIMIT 10
    `;
    const capacityResult = await pool.query(capacityQuery);
    const bedCapacityData = capacityResult.rows.map(row => ({
      bed: row.bed,
      current: parseInt(row.current),
      capacity: parseInt(row.capacity),
      percentage: parseFloat(row.percentage)
    }));

    // 4. Daily Task Completion Rate (Last 7 days)
    const taskQuery = `
      WITH last_7_days AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS day
      ),
      task_stats AS (
        SELECT 
          DATE(completion_date) as day,
          COUNT(*) as completed
        FROM daily_task_completions
        WHERE completion_date >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(completion_date)
      ),
      expected_tasks AS (
        SELECT 
          l7d.day,
          COUNT(b.bed_id) * COUNT(bt.task_id) as total_tasks
        FROM last_7_days l7d
        CROSS JOIN beds b
        CROSS JOIN bed_tasks bt
        WHERE bt.is_default = TRUE
        GROUP BY l7d.day
      )
      SELECT 
        TO_CHAR(l7d.day, 'Dy') as day,
        COALESCE(ts.completed, 0) as completed,
        et.total_tasks - COALESCE(ts.completed, 0) as pending
      FROM last_7_days l7d
      LEFT JOIN task_stats ts ON l7d.day = ts.day
      LEFT JOIN expected_tasks et ON l7d.day = et.day
      ORDER BY l7d.day
    `;
    const taskResult = await pool.query(taskQuery);
    const taskCompletionData = taskResult.rows.map(row => ({
      day: row.day,
      completed: parseInt(row.completed),
      pending: parseInt(row.pending)
    }));

    // Summary statistics
    const summaryQuery = `
      SELECT 
        (SELECT COUNT(*) FROM batches) as total_batches,
        (SELECT COALESCE(SUM(wildlings_count), 0) FROM batches) as total_plants,
        (SELECT COALESCE(SUM(current_occupancy), 0) FROM beds) as plants_in_beds,
        (SELECT COUNT(*) FROM users WHERE role = 'field_worker' AND is_active = TRUE) as active_workers
    `;
    const summaryResult = await pool.query(summaryQuery);
    const summary = summaryResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        plantGrowthData: growthData,
        speciesDistribution,
        bedCapacityData,
        taskCompletionData,
        summary: {
          total_batches: parseInt(summary.total_batches),
          total_plants: parseInt(summary.total_plants),
          plants_in_beds: parseInt(summary.plants_in_beds),
          active_workers: parseInt(summary.active_workers)
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
