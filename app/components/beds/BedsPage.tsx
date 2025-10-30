"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, MapPin, User, Layers, TrendingUp } from 'lucide-react';

interface Bed {
  bed_id: number;
  bed_name: string;
  location_name: string;
  species_category: 'Fruit Tree' | 'Forestry' | 'Ornamental';
  person_in_charge: string | null;
  in_charge_id: number | null;
  capacity: number | null;
  current_occupancy: number;
  occupancy_percentage: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function BedsPage() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/beds');
      const data = await response.json();

      if (data.success) {
        setBeds(data.beds);
      } else {
        setError('Failed to load beds');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Forestry':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Fruit Tree':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Ornamental':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOccupancyColor = (percentage: number | null) => {
    if (!percentage) return 'text-gray-500';
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Plant Beds Management</h1>
        <p className="text-muted-foreground text-lg">
          Monitor and manage plant beds across all locations
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Beds</p>
              <p className="text-3xl font-bold">{beds.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Forestry Beds</p>
              <p className="text-3xl font-bold">
                {beds.filter(b => b.species_category === 'Forestry').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Fruit Tree Beds</p>
              <p className="text-3xl font-bold">
                {beds.filter(b => b.species_category === 'Fruit Tree').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Ornamental Beds</p>
              <p className="text-3xl font-bold">
                {beds.filter(b => b.species_category === 'Ornamental').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading beds...</span>
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {beds.map((bed) => (
            <Card key={bed.bed_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{bed.bed_name}</CardTitle>
                  <Badge className={`${getCategoryColor(bed.species_category)}`}>
                    {bed.species_category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{bed.location_name}</p>
                    </div>
                  </div>

                  {bed.person_in_charge && (
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">Person in Charge</p>
                        <p className="font-medium">{bed.person_in_charge}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <Layers className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div className="text-sm flex-1">
                      <p className="text-muted-foreground">Capacity</p>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {bed.current_occupancy} / {bed.capacity || '∞'}
                        </p>
                        {bed.occupancy_percentage && (
                          <span className={`text-xs font-semibold ${getOccupancyColor(bed.occupancy_percentage)}`}>
                            {bed.occupancy_percentage}%
                          </span>
                        )}
                      </div>
                      {bed.capacity && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              bed.occupancy_percentage && bed.occupancy_percentage >= 90
                                ? 'bg-red-600'
                                : bed.occupancy_percentage && bed.occupancy_percentage >= 70
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(bed.occupancy_percentage || 0, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {bed.notes && (
                    <div className="text-sm bg-muted/50 p-3 rounded-lg">
                      <p className="text-muted-foreground mb-1">Notes:</p>
                      <p>{bed.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
