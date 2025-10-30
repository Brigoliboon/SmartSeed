"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Layers, MapPin, Sprout, CheckCircle2, Clock } from 'lucide-react';

interface Bed {
  bed_id: number;
  bed_name: string;
  location_name: string;
  species_category: string;
  capacity: number;
  current_occupancy: number;
  qr_code: string;
  notes: string;
  tasks_completed_today?: boolean;
}

interface FieldWorkerDashboardProps {
  userId: number;
}

export function FieldWorkerDashboard({ userId }: FieldWorkerDashboardProps) {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBeds: 0,
    completedToday: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    fetchMyBeds();
  }, [userId]);

  const fetchMyBeds = async () => {
    try {
      setLoading(true);
      // Fetch beds assigned to this user
      const response = await fetch(`/api/beds?assignedTo=${userId}`);
      const data = await response.json();

      if (data.success) {
        setBeds(data.beds);
        
        // Calculate stats
        const completed = data.beds.filter((b: Bed) => b.tasks_completed_today).length;
        setStats({
          totalBeds: data.beds.length,
          completedToday: completed,
          pendingTasks: data.beds.length - completed
        });
      }
    } catch (error) {
      console.error('Error fetching beds:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOccupancyPercentage = (bed: Bed) => {
    if (!bed.capacity) return 0;
    return Math.round((bed.current_occupancy / bed.capacity) * 100);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Forestry': 'bg-green-100 text-green-800 border-green-200',
      'Fruit Tree': 'bg-orange-100 text-orange-800 border-orange-200',
      'Ornamental': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your beds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Assigned Beds</h1>
        <p className="text-muted-foreground">
          View and manage the plant beds assigned to you
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Beds</p>
                <p className="text-3xl font-bold">{stats.totalBeds}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedToday}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Beds List */}
      {beds.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <Layers className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No Beds Assigned</h3>
                <p className="text-muted-foreground">
                  You don't have any beds assigned to you yet. Please contact your administrator.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {beds.map((bed) => (
            <Card key={bed.bed_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{bed.bed_name}</CardTitle>
                  {bed.tasks_completed_today ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{bed.location_name}</span>
                  </div>
                  <Badge className={getCategoryColor(bed.species_category)}>
                    {bed.species_category}
                  </Badge>
                </div>

                {/* Occupancy */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Occupancy</span>
                    </div>
                    <span className="text-muted-foreground">
                      {bed.current_occupancy} / {bed.capacity || 'N/A'}
                    </span>
                  </div>
                  {bed.capacity && (
                    <div className="space-y-1">
                      <Progress value={getOccupancyPercentage(bed)} className="h-2" />
                      <p className="text-xs text-right text-muted-foreground">
                        {getOccupancyPercentage(bed)}% full
                      </p>
                    </div>
                  )}
                </div>

                {/* QR Code */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">QR Code</p>
                      <p className="font-mono text-sm">{bed.qr_code}</p>
                    </div>
                  </div>
                </div>

                {bed.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{bed.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Sprout className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-blue-900">How to complete tasks</h3>
              <p className="text-sm text-blue-800">
                Go to "Scan QR Code" menu and scan the bed's QR code to view and complete daily maintenance tasks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
