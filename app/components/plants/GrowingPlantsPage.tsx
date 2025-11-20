"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  Search, 
  Filter, 
  Sprout,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Leaf,
  Clock
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface GrowingPlant {
  id: number;
  species_name: string;
  scientific_name: string;
  category: 'Forestry' | 'Fruit Tree' | 'Ornamental';
  quantity: number;
  batch_id: string;
  bed_location: string;
  planting_date: string;
  estimated_maturity_date: string;
  days_to_maturity: number;
  current_age_days: number;
  growth_stage: 'Seedling' | 'Juvenile' | 'Pre-mature' | 'Ready';
  health_status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  notes?: string;
}

export function GrowingPlantsPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<GrowingPlant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<GrowingPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStage, setFilterStage] = useState('all');

  useEffect(() => {
    fetchGrowingPlants();
  }, []);

  useEffect(() => {
    filterPlants();
  }, [searchQuery, filterCategory, filterStage, plants]);

  const fetchGrowingPlants = async () => {
    try {
      setLoading(true);
      
      // Generate realistic dummy data for growing plants
      const today = new Date();
      
      const dummyPlants: GrowingPlant[] = [
        {
          id: 1,
          species_name: 'Narra',
          scientific_name: 'Pterocarpus indicus',
          category: 'Forestry',
          quantity: 850,
          batch_id: 'WLD-202410-001',
          bed_location: 'BED-001 (North Section)',
          planting_date: '2024-08-15',
          estimated_maturity_date: '2025-02-15',
          days_to_maturity: 180,
          current_age_days: 77,
          growth_stage: 'Juvenile',
          health_status: 'Excellent',
          notes: 'Fast growing batch, excellent root development'
        },
        {
          id: 2,
          species_name: 'Mahogany',
          scientific_name: 'Swietenia macrophylla',
          category: 'Forestry',
          quantity: 1200,
          batch_id: 'WLD-202409-015',
          bed_location: 'BED-002 (North Section)',
          planting_date: '2024-07-20',
          estimated_maturity_date: '2025-01-20',
          days_to_maturity: 180,
          current_age_days: 103,
          growth_stage: 'Juvenile',
          health_status: 'Good',
          notes: 'Regular watering schedule maintained'
        },
        {
          id: 3,
          species_name: 'Mango',
          scientific_name: 'Mangifera indica',
          category: 'Fruit Tree',
          quantity: 450,
          batch_id: 'WLD-202410-005',
          bed_location: 'BED-007 (South Section)',
          planting_date: '2024-09-01',
          estimated_maturity_date: '2025-03-01',
          days_to_maturity: 180,
          current_age_days: 60,
          growth_stage: 'Seedling',
          health_status: 'Excellent'
        },
        {
          id: 4,
          species_name: 'Acacia',
          scientific_name: 'Acacia mangium',
          category: 'Forestry',
          quantity: 2100,
          batch_id: 'WLD-202408-022',
          bed_location: 'BED-006 (South Section)',
          planting_date: '2024-06-10',
          estimated_maturity_date: '2024-12-10',
          days_to_maturity: 180,
          current_age_days: 143,
          growth_stage: 'Pre-mature',
          health_status: 'Good',
          notes: 'Ready for distribution in 40 days'
        },
        {
          id: 5,
          species_name: 'Calamansi',
          scientific_name: 'Citrus microcarpa',
          category: 'Fruit Tree',
          quantity: 680,
          batch_id: 'WLD-202409-008',
          bed_location: 'BED-008 (South Section)',
          planting_date: '2024-07-15',
          estimated_maturity_date: '2025-01-15',
          days_to_maturity: 180,
          current_age_days: 108,
          growth_stage: 'Juvenile',
          health_status: 'Excellent',
          notes: 'High germination rate, robust growth'
        },
        {
          id: 6,
          species_name: 'Gmelina',
          scientific_name: 'Gmelina arborea',
          category: 'Forestry',
          quantity: 1850,
          batch_id: 'WLD-202408-018',
          bed_location: 'BED-010 (South Section)',
          planting_date: '2024-06-01',
          estimated_maturity_date: '2024-12-01',
          days_to_maturity: 180,
          current_age_days: 152,
          growth_stage: 'Pre-mature',
          health_status: 'Good',
          notes: 'Almost ready for distribution'
        },
        {
          id: 7,
          species_name: 'Santan',
          scientific_name: 'Ixora coccinea',
          category: 'Ornamental',
          quantity: 320,
          batch_id: 'WLD-202410-012',
          bed_location: 'BED-011 (East Greenhouse)',
          planting_date: '2024-09-10',
          estimated_maturity_date: '2025-01-10',
          days_to_maturity: 120,
          current_age_days: 51,
          growth_stage: 'Seedling',
          health_status: 'Excellent'
        },
        {
          id: 8,
          species_name: 'Avocado',
          scientific_name: 'Persea americana',
          category: 'Fruit Tree',
          quantity: 550,
          batch_id: 'WLD-202409-020',
          bed_location: 'BED-015 (East Greenhouse)',
          planting_date: '2024-08-05',
          estimated_maturity_date: '2025-02-05',
          days_to_maturity: 180,
          current_age_days: 87,
          growth_stage: 'Juvenile',
          health_status: 'Good',
          notes: 'Requires consistent moisture'
        },
        {
          id: 9,
          species_name: 'Bougainvillea',
          scientific_name: 'Bougainvillea spectabilis',
          category: 'Ornamental',
          quantity: 280,
          batch_id: 'WLD-202410-007',
          bed_location: 'BED-016 (West Field)',
          planting_date: '2024-09-15',
          estimated_maturity_date: '2025-01-15',
          days_to_maturity: 120,
          current_age_days: 46,
          growth_stage: 'Seedling',
          health_status: 'Excellent'
        },
        {
          id: 10,
          species_name: 'Guava',
          scientific_name: 'Psidium guajava',
          category: 'Fruit Tree',
          quantity: 720,
          batch_id: 'WLD-202409-025',
          bed_location: 'BED-012 (East Greenhouse)',
          planting_date: '2024-08-01',
          estimated_maturity_date: '2025-02-01',
          days_to_maturity: 180,
          current_age_days: 91,
          growth_stage: 'Juvenile',
          health_status: 'Good'
        },
        {
          id: 11,
          species_name: 'Hibiscus',
          scientific_name: 'Hibiscus rosa-sinensis',
          category: 'Ornamental',
          quantity: 410,
          batch_id: 'WLD-202410-003',
          bed_location: 'BED-019 (West Field)',
          planting_date: '2024-09-20',
          estimated_maturity_date: '2025-01-20',
          days_to_maturity: 120,
          current_age_days: 41,
          growth_stage: 'Seedling',
          health_status: 'Excellent'
        },
        {
          id: 12,
          species_name: 'Rosal',
          scientific_name: 'Rosa spp.',
          category: 'Ornamental',
          quantity: 190,
          batch_id: 'WLD-202410-009',
          bed_location: 'BED-013 (East Greenhouse)',
          planting_date: '2024-09-25',
          estimated_maturity_date: '2025-01-25',
          days_to_maturity: 120,
          current_age_days: 36,
          growth_stage: 'Seedling',
          health_status: 'Good',
          notes: 'Requires careful pest monitoring'
        }
      ];
      
      setPlants(dummyPlants);
      setFilteredPlants(dummyPlants);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching growing plants:', error);
      setLoading(false);
    }
  };

  const filterPlants = () => {
    let filtered = plants;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(plant => 
        plant.species_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.batch_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.bed_location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(plant => plant.category === filterCategory);
    }

    // Filter by growth stage
    if (filterStage !== 'all') {
      filtered = filtered.filter(plant => plant.growth_stage === filterStage);
    }

    setFilteredPlants(filtered);
  };

  const getTotalByCategory = (category: string) => {
    return plants
      .filter(p => p.category === category)
      .reduce((sum, p) => sum + p.quantity, 0);
  };

  const getTotalPlants = () => {
    return plants.reduce((sum, p) => sum + p.quantity, 0);
  };

  const getAverageMaturityDays = () => {
    const total = plants.reduce((sum, p) => sum + (p.days_to_maturity - p.current_age_days), 0);
    return Math.round(total / plants.length);
  };

  const getReadySoonCount = () => {
    return plants.filter(p => {
      const daysRemaining = p.days_to_maturity - p.current_age_days;
      return daysRemaining <= 30;
    }).length;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-yellow-600';
      case 'Poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGrowthStageColor = (stage: string) => {
    switch (stage) {
      case 'Seedling': return 'bg-blue-100 text-blue-800';
      case 'Juvenile': return 'bg-purple-100 text-purple-800';
      case 'Pre-mature': return 'bg-orange-100 text-orange-800';
      case 'Ready': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysRemaining = (plant: GrowingPlant) => {
    return plant.days_to_maturity - plant.current_age_days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Growing Plants</h1>
        <p className="text-muted-foreground">Monitor all plants currently growing in the nursery</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Growing Plants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalPlants().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {plants.length} batches
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Forestry Species</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalByCategory('Forestry').toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {plants.filter(p => p.category === 'Forestry').length} batches
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fruit Trees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalByCategory('Fruit Tree').toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {plants.filter(p => p.category === 'Fruit Tree').length} batches
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ornamental Plants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalByCategory('Ornamental').toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {plants.filter(p => p.category === 'Ornamental').length} batches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Days to Maturity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="text-2xl font-bold">{getAverageMaturityDays()}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ready Soon (≤30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold">{getReadySoonCount()}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Species Varieties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold">
                {new Set(plants.map(p => p.species_name)).size}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by species, batch, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Forestry">Forestry</SelectItem>
                <SelectItem value="Fruit Tree">Fruit Tree</SelectItem>
                <SelectItem value="Ornamental">Ornamental</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Sprout className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Growth Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="Seedling">Seedling</SelectItem>
                <SelectItem value="Juvenile">Juvenile</SelectItem>
                <SelectItem value="Pre-mature">Pre-mature</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Plants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Growing Plants Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredPlants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sprout className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No growing plants found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Species</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Planted</TableHead>
                    <TableHead>Maturity Date</TableHead>
                    <TableHead className="text-center">Days Left</TableHead>
                    <TableHead>Growth Stage</TableHead>
                    <TableHead>Health</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlants.map((plant) => {
                    const daysRemaining = getDaysRemaining(plant);
                    return (
                      <TableRow key={plant.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{plant.species_name}</div>
                            <div className="text-xs text-muted-foreground italic">
                              {plant.scientific_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{plant.category}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {plant.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {plant.batch_id}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm">{plant.bed_location}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(plant.planting_date)}
                          <div className="text-xs text-muted-foreground">
                            ({plant.current_age_days} days ago)
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDate(plant.estimated_maturity_date)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={daysRemaining <= 30 ? "default" : "secondary"}
                            className={daysRemaining <= 30 ? "bg-green-600" : ""}
                          >
                            {daysRemaining} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGrowthStageColor(plant.growth_stage)}>
                            {plant.growth_stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getHealthStatusColor(plant.health_status)}`}>
                            {plant.health_status}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
