// SmartSeed TypeScript Type Definitions

export type UserRole = 'admin' | 'field_worker' | 'cenro' | 'nursery_staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface SensorData {
  id: string;
  sensor_id: string;
  batch_id: string;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  light_level: number;
  timestamp: string;
}

export interface PlantBatch {
  id: string;
  batch_code: string;
  species_name: string;
  common_name: string;
  quantity: number;
  status: 'germinating' | 'growing' | 'ready' | 'distributed' | 'archived';
  health_status: 'excellent' | 'good' | 'fair' | 'poor';
  date_planted: string;
  estimated_ready_date: string;
  location: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ScanResult {
  id: string;
  batch_id: string;
  image_url: string;
  species_detected: string;
  confidence: number;
  health_assessment: 'healthy' | 'stressed' | 'diseased';
  recommendations: string[];
  timestamp: string;
  scanned_by: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  batch_id?: string;
  sensor_id?: string;
  is_read: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface InventoryStats {
  total_batches: number;
  total_plants: number;
  ready_for_distribution: number;
  health_issues: number;
  active_alerts: number;
}

export interface DashboardMetrics {
  inventory_stats: InventoryStats;
  recent_scans: ScanResult[];
  active_alerts: Alert[];
  sensor_readings: SensorData[];
}
