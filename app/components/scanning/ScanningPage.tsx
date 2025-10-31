"use client"

import { CameraQRScanner } from '../tasks/CameraQRScanner';
import { User as SupabaseUser } from '../../types';

interface PostgresUser {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

interface ScanningPageProps {
  user?: SupabaseUser | PostgresUser | any;
}

export function ScanningPage({ user }: ScanningPageProps = {}) {
  // Convert Supabase user to Postgres user format if needed
  let pgUser: PostgresUser;
  
  if (user && 'user_id' in user) {
    // Already in Postgres format
    pgUser = user as PostgresUser;
  } else if (user && 'id' in user) {
    // Convert from Supabase format
    pgUser = {
      user_id: parseInt(user.id) || 1,
      name: user.name || 'Unknown User',
      email: user.email || '',
      role: user.role || 'field_worker'
    };
  } else {
    // Default user for testing
    pgUser = {
      user_id: 2,
      name: 'Juan Dela Cruz',
      email: 'juan@Smartseed.com',
      role: 'field_worker'
    };
  }

  return <CameraQRScanner user={pgUser} />;
}
