"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, MapPin, User, Layers, ChevronRight } from 'lucide-react';

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

export function MobileBedsPage() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  const categories = ['All', 'Forestry', 'Fruit Tree', 'Ornamental'];
  
  const filteredBeds = selectedCategory === 'All' 
    ? beds 
    : beds.filter(bed => bed.species_category === selectedCategory);

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">My Beds</h1>
        <p className="text-sm text-muted-foreground">
          {beds.length} bed{beds.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {/* Category Filter - Horizontal Scroll */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
              {category !== 'All' && (
                <span className="ml-2 text-xs">
                  ({beds.filter(b => b.species_category === category).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <span className="text-sm text-muted-foreground">Loading beds...</span>
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {filteredBeds.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No beds found in this category
              </CardContent>
            </Card>
          ) : (
            filteredBeds.map((bed) => (
              <Card key={bed.bed_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{bed.bed_name}</h3>
                      <Badge className={`${getCategoryColor(bed.species_category)} text-xs`}>
                        {bed.species_category}
                      </Badge>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{bed.location_name}</span>
                    </div>

                    {bed.person_in_charge && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{bed.person_in_charge}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Layers className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-muted-foreground">
                            {bed.current_occupancy} / {bed.capacity || '∞'} plants
                          </span>
                          {bed.occupancy_percentage && (
                            <span className={`text-xs font-semibold ${getOccupancyColor(bed.occupancy_percentage)}`}>
                              {bed.occupancy_percentage}%
                            </span>
                          )}
                        </div>
                        {bed.capacity && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
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
                      <div className="text-xs bg-muted/50 p-2 rounded-md mt-2">
                        <p className="text-muted-foreground">{bed.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
