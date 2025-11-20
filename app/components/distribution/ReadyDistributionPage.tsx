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
  TrendingUp,
  Calendar,
  Package,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Users
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ReadyPlant {
  id: number;
  species_name: string;
  scientific_name: string;
  category: 'Forestry' | 'Fruit Tree' | 'Ornamental';
  quantity: number;
  batch_id: string;
  bed_location: string;
  planting_date: string;
  ready_date: string;
  days_mature: number;
  quality_grade: 'A' | 'B' | 'C';
  height_cm: number;
  health_status: 'Excellent' | 'Good' | 'Fair';
  reserved_quantity?: number;
  available_quantity: number;
  notes?: string;
}

export function ReadyDistributionPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<ReadyPlant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<ReadyPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');

  useEffect(() => {
    fetchReadyPlants();
  }, []);

  useEffect(() => {
    filterPlants();
  }, [searchQuery, filterCategory, filterGrade, plants]);

  const fetchReadyPlants = async () => {
    try {
      setLoading(true);
      
      // Generate realistic dummy data for ready plants
      const today = new Date();
      
      const dummyPlants: ReadyPlant[] = [
        {
          id: 1,
          species_name: 'Narra',
          scientific_name: 'Pterocarpus indicus',
          category: 'Forestry',
          quantity: 650,
          batch_id: 'WLD-202404-008',
          bed_location: 'BED-001 (North Section)',
          planting_date: '2024-04-15',
          ready_date: '2024-10-12',
          days_mature: 199,
          quality_grade: 'A',
          height_cm: 45,
          health_status: 'Excellent',
          reserved_quantity: 200,
          available_quantity: 450,
          notes: 'Premium quality, excellent root system'
        },
        {
          id: 2,
          species_name: 'Mahogany',
          scientific_name: 'Swietenia macrophylla',
          category: 'Forestry',
          quantity: 890,
          batch_id: 'WLD-202403-022',
          bed_location: 'BED-002 (North Section)',
          planting_date: '2024-03-20',
          ready_date: '2024-09-16',
          days_mature: 225,
          quality_grade: 'A',
          height_cm: 48,
          health_status: 'Excellent',
          reserved_quantity: 300,
          available_quantity: 590,
          notes: 'High demand species, ready for large-scale distribution'
        },
        {
          id: 3,
          species_name: 'Acacia',
          scientific_name: 'Acacia mangium',
          category: 'Forestry',
          quantity: 1200,
          batch_id: 'WLD-202402-015',
          bed_location: 'BED-006 (South Section)',
          planting_date: '2024-02-10',
          ready_date: '2024-08-09',
          days_mature: 263,
          quality_grade: 'A',
          height_cm: 52,
          health_status: 'Excellent',
          reserved_quantity: 500,
          available_quantity: 700,
          notes: 'Fast-growing, ideal for erosion control'
        },
        {
          id: 4,
          species_name: 'Gmelina',
          scientific_name: 'Gmelina arborea',
          category: 'Forestry',
          quantity: 780,
          batch_id: 'WLD-202404-003',
          bed_location: 'BED-010 (South Section)',
          planting_date: '2024-04-01',
          ready_date: '2024-09-28',
          days_mature: 212,
          quality_grade: 'B',
          height_cm: 42,
          health_status: 'Good',
          available_quantity: 780,
          notes: 'Good for timber production'
        },
        {
          id: 5,
          species_name: 'Mango',
          scientific_name: 'Mangifera indica',
          category: 'Fruit Tree',
          quantity: 320,
          batch_id: 'WLD-202403-018',
          bed_location: 'BED-007 (South Section)',
          planting_date: '2024-03-15',
          ready_date: '2024-09-11',
          days_mature: 231,
          quality_grade: 'A',
          height_cm: 55,
          health_status: 'Excellent',
          reserved_quantity: 150,
          available_quantity: 170,
          notes: 'Carabao variety, grafted seedlings'
        },
        {
          id: 6,
          species_name: 'Calamansi',
          scientific_name: 'Citrus microcarpa',
          category: 'Fruit Tree',
          quantity: 420,
          batch_id: 'WLD-202404-012',
          bed_location: 'BED-008 (South Section)',
          planting_date: '2024-04-10',
          ready_date: '2024-10-07',
          days_mature: 204,
          quality_grade: 'A',
          height_cm: 38,
          health_status: 'Excellent',
          reserved_quantity: 100,
          available_quantity: 320,
          notes: 'High fruit yield potential'
        },
        {
          id: 7,
          species_name: 'Guava',
          scientific_name: 'Psidium guajava',
          category: 'Fruit Tree',
          quantity: 380,
          batch_id: 'WLD-202403-025',
          bed_location: 'BED-012 (East Greenhouse)',
          planting_date: '2024-03-05',
          ready_date: '2024-09-01',
          days_mature: 241,
          quality_grade: 'B',
          height_cm: 46,
          health_status: 'Good',
          reserved_quantity: 80,
          available_quantity: 300
        },
        {
          id: 8,
          species_name: 'Avocado',
          scientific_name: 'Persea americana',
          category: 'Fruit Tree',
          quantity: 280,
          batch_id: 'WLD-202404-006',
          bed_location: 'BED-015 (East Greenhouse)',
          planting_date: '2024-04-05',
          ready_date: '2024-10-02',
          days_mature: 209,
          quality_grade: 'A',
          height_cm: 50,
          health_status: 'Excellent',
          reserved_quantity: 120,
          available_quantity: 160,
          notes: 'Hass variety, premium quality'
        },
        {
          id: 9,
          species_name: 'Santan',
          scientific_name: 'Ixora coccinea',
          category: 'Ornamental',
          quantity: 450,
          batch_id: 'WLD-202405-012',
          bed_location: 'BED-011 (East Greenhouse)',
          planting_date: '2024-05-10',
          ready_date: '2024-09-08',
          days_mature: 175,
          quality_grade: 'A',
          height_cm: 30,
          health_status: 'Excellent',
          available_quantity: 450,
          notes: 'Vibrant red flowers, ready for landscaping'
        },
        {
          id: 10,
          species_name: 'Bougainvillea',
          scientific_name: 'Bougainvillea spectabilis',
          category: 'Ornamental',
          quantity: 340,
          batch_id: 'WLD-202405-007',
          bed_location: 'BED-016 (West Field)',
          planting_date: '2024-05-15',
          ready_date: '2024-09-13',
          days_mature: 170,
          quality_grade: 'A',
          height_cm: 35,
          health_status: 'Excellent',
          reserved_quantity: 90,
          available_quantity: 250,
          notes: 'Multiple colors available'
        },
        {
          id: 11,
          species_name: 'Hibiscus',
          scientific_name: 'Hibiscus rosa-sinensis',
          category: 'Ornamental',
          quantity: 390,
          batch_id: 'WLD-202405-003',
          bed_location: 'BED-019 (West Field)',
          planting_date: '2024-05-20',
          ready_date: '2024-09-18',
          days_mature: 165,
          quality_grade: 'B',
          height_cm: 32,
          health_status: 'Good',
          available_quantity: 390
        },
        {
          id: 12,
          species_name: 'Rosal',
          scientific_name: 'Rosa spp.',
          category: 'Ornamental',
          quantity: 220,
          batch_id: 'WLD-202405-009',
          bed_location: 'BED-013 (East Greenhouse)',
          planting_date: '2024-05-25',
          ready_date: '2024-09-23',
          days_mature: 160,
          quality_grade: 'A',
          height_cm: 28,
          health_status: 'Excellent',
          reserved_quantity: 70,
          available_quantity: 150,
          notes: 'Various rose varieties, fragrant'
        }
      ];
      
      setPlants(dummyPlants);
      setFilteredPlants(dummyPlants);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ready plants:', error);
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

    // Filter by quality grade
    if (filterGrade !== 'all') {
      filtered = filtered.filter(plant => plant.quality_grade === filterGrade);
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

  const getTotalAvailable = () => {
    return plants.reduce((sum, p) => sum + p.available_quantity, 0);
  };

  const getTotalReserved = () => {
    return plants.reduce((sum, p) => sum + (p.reserved_quantity || 0), 0);
  };

  const getGradeACount = () => {
    return plants.filter(p => p.quality_grade === 'A').reduce((sum, p) => sum + p.quantity, 0);
  };

  const getQualityGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
        <h1 className="text-3xl font-bold">Ready for Distribution</h1>
        <p className="text-muted-foreground">Mature plants ready for distribution to beneficiaries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ready</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getTotalAvailable().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready to distribute
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{getTotalReserved().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              For approved requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Grade A Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getGradeACount().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Premium seedlings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Species Varieties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(plants.map(p => p.species_name)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Different species
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Forestry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getTotalByCategory('Forestry').toLocaleString()}</div>
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
            <div className="text-2xl font-bold text-orange-600">{getTotalByCategory('Fruit Tree').toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {plants.filter(p => p.category === 'Fruit Tree').length} batches
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ornamental</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{getTotalByCategory('Ornamental').toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {plants.filter(p => p.category === 'Ornamental').length} batches
            </p>
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
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <CheckCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Quality Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="A">Grade A</SelectItem>
                <SelectItem value="B">Grade B</SelectItem>
                <SelectItem value="C">Grade C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Plants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredPlants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No ready plants found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Species</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Total Qty</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead className="text-center">Reserved</TableHead>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Ready Date</TableHead>
                    <TableHead className="text-center">Height</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Health</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlants.map((plant) => (
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
                      <TableCell className="text-center">
                        <span className="font-medium text-green-600">
                          {plant.available_quantity.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {plant.reserved_quantity ? (
                          <span className="font-medium text-orange-600">
                            {plant.reserved_quantity.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {plant.batch_id}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {plant.bed_location}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(plant.ready_date)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ({plant.days_mature} days)
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{plant.height_cm} cm</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getQualityGradeColor(plant.quality_grade)}>
                          Grade {plant.quality_grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getHealthStatusColor(plant.health_status)}`}>
                          {plant.health_status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
