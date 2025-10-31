"use client"

import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Layers, MapPin, CheckCircle2, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import { User } from '../../types';
import { useRouter } from 'next/navigation';

interface Bed {
  bed_id: number;
  bed_name: string;
  location_name: string;
  species_category: string;
  qr_code: string;
  tasks_completed_today: boolean;
}

interface MobileDashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

export function MobileDashboard({ user, onNavigate }: MobileDashboardProps) {
  const router = useRouter();
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBeds();
  }, [user]);

  const fetchMyBeds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/beds?assignedTo=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setBeds(data.beds);
      }
    } catch (error) {
      console.error('Error fetching beds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBedClick = (bed: Bed) => {
    router.push(`/task?qr=${bed.qr_code}`);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Forestry': 'bg-green-100 text-green-800',
      'Fruit Tree': 'bg-orange-100 text-orange-800',
      'Ornamental': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your beds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Quick Action - Scan QR */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="pt-6">
          <Button 
            onClick={() => onNavigate('scanning')}
            className="w-full h-16 text-lg bg-white text-primary hover:bg-gray-100"
          >
            <QrCode className="w-6 h-6 mr-2" />
            Scan QR Code
          </Button>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="px-1">
        <h2 className="text-2xl font-bold mb-1">My Plant Beds</h2>
        <p className="text-muted-foreground">
          {beds.filter(b => b.tasks_completed_today).length} of {beds.length} completed today
        </p>
      </div>

      {/* Beds List */}
      {beds.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
            <p className="text-muted-foreground">No beds assigned to you yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {beds.map((bed) => (
            <Card 
              key={bed.bed_id}
              className={`transition-all active:scale-98 ${
                bed.tasks_completed_today ? 'border-green-500 bg-green-50' : 'border-2'
              }`}
              onClick={() => handleBedClick(bed)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{bed.bed_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{bed.location_name}</span>
                    </div>
                  </div>
                  {bed.tasks_completed_today ? (
                    <div className="flex items-center gap-1 text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Done</span>
                    </div>
                  ) : (
                    <Badge className={getCategoryColor(bed.species_category)}>
                      {bed.species_category}
                    </Badge>
                  )}
                </div>

                <Button 
                  className="w-full"
                  variant={bed.tasks_completed_today ? "outline" : "default"}
                >
                  {bed.tasks_completed_today ? 'View Tasks' : 'Start Tasks'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
