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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { 
  Search, 
  Filter, 
  User,
  MapPin,
  Phone,
  Mail,
  Building2,
  Calendar,
  Package,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Beneficiary {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  organization?: string;
  organization_type?: string;
  registration_date: string;
  total_requests: number;
  total_seedlings_received: number;
  last_distribution?: string;
  status: 'active' | 'inactive';
  notes?: string;
}

export function BeneficiariesPage() {
  const router = useRouter();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrgType, setFilterOrgType] = useState('all');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  useEffect(() => {
    filterBeneficiaries();
  }, [searchQuery, filterStatus, filterOrgType, beneficiaries]);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      
      // Generate realistic dummy data for beneficiaries
      const dummyBeneficiaries: Beneficiary[] = [
        {
          id: 1,
          name: 'Juan Dela Cruz',
          email: 'juan.delacruz@example.com',
          phone: '+63 917 123 4567',
          address: 'Barangay San Isidro, Antipolo City, Rizal',
          organization: 'San Isidro Farmers Association',
          organization_type: 'Farmers Association',
          registration_date: '2024-01-15',
          total_requests: 5,
          total_seedlings_received: 2500,
          last_distribution: '2024-10-20',
          status: 'active',
          notes: 'Regular beneficiary, excellent track record'
        },
        {
          id: 2,
          name: 'Maria Santos',
          email: 'maria.santos@gmail.com',
          phone: '+63 918 234 5678',
          address: 'Sitio Maligaya, Rodriguez, Rizal',
          registration_date: '2024-02-20',
          total_requests: 3,
          total_seedlings_received: 800,
          last_distribution: '2024-10-15',
          status: 'active',
          notes: 'First-time community organizer'
        },
        {
          id: 3,
          name: 'Pedro Reyes',
          email: 'preyes@yahoo.com',
          phone: '+63 919 345 6789',
          address: 'Barangay Tanay, Tanay, Rizal',
          organization: 'Green Tanay Movement',
          organization_type: 'NGO',
          registration_date: '2023-11-10',
          total_requests: 8,
          total_seedlings_received: 4200,
          last_distribution: '2024-10-25',
          status: 'active',
          notes: 'Environmental advocacy group, very active'
        },
        {
          id: 4,
          name: 'Linda Garcia',
          email: 'linda.garcia@school.edu.ph',
          phone: '+63 920 456 7890',
          address: 'Morong National High School, Morong, Rizal',
          organization: 'Morong NHS',
          organization_type: 'Educational Institution',
          registration_date: '2023-08-05',
          total_requests: 12,
          total_seedlings_received: 6500,
          last_distribution: '2024-09-30',
          status: 'active',
          notes: 'Annual tree planting program'
        },
        {
          id: 5,
          name: 'Roberto Cruz',
          email: 'rob.cruz@barangay.gov.ph',
          phone: '+63 921 567 8901',
          address: 'Barangay Hall, Pililla, Rizal',
          organization: 'Barangay Pililla LGU',
          organization_type: 'LGU',
          registration_date: '2023-06-12',
          total_requests: 15,
          total_seedlings_received: 9800,
          last_distribution: '2024-10-28',
          status: 'active',
          notes: 'Government partner, food security program'
        },
        {
          id: 6,
          name: 'Ana Mercado',
          email: 'ana.mercado@ngo.org',
          phone: '+63 922 678 9012',
          address: 'Baras, Rizal',
          organization: 'Baras Environmental Foundation',
          organization_type: 'NGO',
          registration_date: '2023-04-18',
          total_requests: 10,
          total_seedlings_received: 7500,
          last_distribution: '2024-10-12',
          status: 'active',
          notes: 'Focuses on erosion control projects'
        },
        {
          id: 7,
          name: 'Carlos Fernandez',
          email: 'carlos.f@gmail.com',
          phone: '+63 923 789 0123',
          address: 'Teresa, Rizal',
          registration_date: '2024-05-22',
          total_requests: 2,
          total_seedlings_received: 350,
          last_distribution: '2024-08-14',
          status: 'active'
        },
        {
          id: 8,
          name: 'Elena Ramos',
          email: 'elena.ramos@cooperative.ph',
          phone: '+63 924 890 1234',
          address: 'Cardona Multi-Purpose Cooperative, Cardona, Rizal',
          organization: 'Cardona MPC',
          organization_type: 'Cooperative',
          registration_date: '2023-09-30',
          total_requests: 7,
          total_seedlings_received: 3900,
          last_distribution: '2024-10-22',
          status: 'active',
          notes: 'Livelihood-focused cooperative'
        },
        {
          id: 9,
          name: 'Francisco Torres',
          email: 'ftorres@church.org',
          phone: '+63 925 901 2345',
          address: 'San Mateo Parish Church, San Mateo, Rizal',
          organization: 'San Mateo Parish',
          organization_type: 'Religious Organization',
          registration_date: '2024-01-08',
          total_requests: 4,
          total_seedlings_received: 1200,
          last_distribution: '2024-09-15',
          status: 'active'
        },
        {
          id: 10,
          name: 'Grace Villanueva',
          email: 'grace.v@upland.org',
          phone: '+63 926 012 3456',
          address: 'Sitio Cambantoc, Cainta, Rizal',
          organization: 'Upland Development Program',
          organization_type: 'NGO',
          registration_date: '2023-03-25',
          total_requests: 11,
          total_seedlings_received: 8200,
          last_distribution: '2024-10-18',
          status: 'active',
          notes: 'Works with indigenous communities'
        },
        {
          id: 11,
          name: 'Henry Bautista',
          email: 'hbautista@resort.com',
          phone: '+63 927 123 4567',
          address: 'Mountain Resort, Tanay, Rizal',
          organization: 'Tanay Mountain Resort',
          organization_type: 'Private Business',
          registration_date: '2024-03-14',
          total_requests: 3,
          total_seedlings_received: 900,
          last_distribution: '2024-07-22',
          status: 'active',
          notes: 'Eco-tourism development'
        },
        {
          id: 12,
          name: 'Isabel Santiago',
          email: 'isabel.santiago@youth.org',
          phone: '+63 928 234 5678',
          address: 'SK Federation Office, Binangonan, Rizal',
          organization: 'Binangonan SK Federation',
          organization_type: 'Youth Organization',
          registration_date: '2024-02-11',
          total_requests: 6,
          total_seedlings_received: 2800,
          last_distribution: '2024-10-05',
          status: 'active',
          notes: 'Youth environmental projects'
        },
        {
          id: 13,
          name: 'Jose Alvarez',
          email: 'jalvarez@company.com',
          phone: '+63 929 345 6789',
          address: 'Industrial Park, Cainta, Rizal',
          organization: 'GreenTech Industries',
          organization_type: 'Private Business',
          registration_date: '2023-12-05',
          total_requests: 4,
          total_seedlings_received: 1500,
          last_distribution: '2024-06-18',
          status: 'active',
          notes: 'CSR greening program'
        },
        {
          id: 14,
          name: 'Carmen Lopez',
          email: 'carmen.lopez@barangay.gov.ph',
          phone: '+63 930 456 7890',
          address: 'Barangay Hall, Angono, Rizal',
          organization: 'Barangay Angono LGU',
          organization_type: 'LGU',
          registration_date: '2023-07-20',
          total_requests: 9,
          total_seedlings_received: 5600,
          last_distribution: '2024-10-10',
          status: 'active'
        },
        {
          id: 15,
          name: 'Daniel Reyes',
          email: 'daniel.reyes@farm.ph',
          phone: '+63 931 567 8901',
          address: 'Barangay Sampaloc, Tanay, Rizal',
          organization: 'Tanay Organic Farmers',
          organization_type: 'Farmers Association',
          registration_date: '2024-04-03',
          total_requests: 5,
          total_seedlings_received: 2100,
          last_distribution: '2024-09-25',
          status: 'active',
          notes: 'Organic farming advocate'
        },
        {
          id: 16,
          name: 'Emma Santos',
          email: 'emma.santos@school.edu.ph',
          phone: '+63 932 678 9012',
          address: 'Rodriguez Elementary School, Rodriguez, Rizal',
          organization: 'Rodriguez ES',
          organization_type: 'Educational Institution',
          registration_date: '2023-10-17',
          total_requests: 6,
          total_seedlings_received: 2400,
          last_distribution: '2024-08-30',
          status: 'active'
        },
        {
          id: 17,
          name: 'Fernando Garcia',
          email: 'fgarcia@inactive.com',
          phone: '+63 933 789 0123',
          address: 'Binangonan, Rizal',
          registration_date: '2023-05-15',
          total_requests: 2,
          total_seedlings_received: 600,
          last_distribution: '2023-12-10',
          status: 'inactive',
          notes: 'No activity in past 6 months'
        },
        {
          id: 18,
          name: 'Gloria Ramos',
          email: 'gloria.ramos@women.org',
          phone: '+63 934 890 1234',
          address: 'Pililla, Rizal',
          organization: "Pililla Women's Association",
          organization_type: 'Community Organization',
          registration_date: '2024-01-28',
          total_requests: 4,
          total_seedlings_received: 1800,
          last_distribution: '2024-10-08',
          status: 'active',
          notes: 'Livelihood and environmental program'
        }
      ];
      
      setBeneficiaries(dummyBeneficiaries);
      setFilteredBeneficiaries(dummyBeneficiaries);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      setLoading(false);
    }
  };

  const filterBeneficiaries = () => {
    let filtered = beneficiaries;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(ben => 
        ben.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ben.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ben.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ben.organization && ben.organization.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ben => ben.status === filterStatus);
    }

    // Filter by organization type
    if (filterOrgType !== 'all') {
      filtered = filtered.filter(ben => ben.organization_type === filterOrgType);
    }

    setFilteredBeneficiaries(filtered);
  };

  const handleViewDetails = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsDetailsOpen(true);
  };

  const getTotalSeedlings = () => {
    return beneficiaries.reduce((sum, ben) => sum + ben.total_seedlings_received, 0);
  };

  const getActiveBeneficiaries = () => {
    return beneficiaries.filter(ben => ben.status === 'active').length;
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
        <h1 className="text-3xl font-bold">Beneficiaries</h1>
        <p className="text-muted-foreground">Manage and track all seedling beneficiaries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Beneficiaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beneficiaries.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {getActiveBeneficiaries()} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Seedlings Distributed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalSeedlings().toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {beneficiaries.filter(b => b.organization).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Individuals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {beneficiaries.filter(b => !b.organization).length}
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
                placeholder="Search by name, email, address, or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterOrgType} onValueChange={setFilterOrgType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="LGU">LGU</SelectItem>
                <SelectItem value="NGO">NGO</SelectItem>
                <SelectItem value="Educational Institution">Educational Institution</SelectItem>
                <SelectItem value="Farmers Association">Farmers Association</SelectItem>
                <SelectItem value="Cooperative">Cooperative</SelectItem>
                <SelectItem value="Private Business">Private Business</SelectItem>
                <SelectItem value="Youth Organization">Youth Organization</SelectItem>
                <SelectItem value="Religious Organization">Religious Organization</SelectItem>
                <SelectItem value="Community Organization">Community Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Beneficiaries Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Beneficiaries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredBeneficiaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No beneficiaries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Total Requests</TableHead>
                    <TableHead>Seedlings Received</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBeneficiaries.map((beneficiary) => (
                    <TableRow key={beneficiary.id}>
                      <TableCell className="font-medium">{beneficiary.name}</TableCell>
                      <TableCell>
                        {beneficiary.organization || (
                          <span className="text-muted-foreground italic">Individual</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {beneficiary.organization_type ? (
                          <Badge variant="outline">{beneficiary.organization_type}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{beneficiary.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{beneficiary.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{beneficiary.total_requests}</TableCell>
                      <TableCell className="text-center font-medium">
                        {beneficiary.total_seedlings_received.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={beneficiary.status === 'active' ? 'default' : 'secondary'}>
                          {beneficiary.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(beneficiary)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Beneficiary Details</DialogTitle>
            <DialogDescription>
              Complete information about the beneficiary
            </DialogDescription>
          </DialogHeader>
          
          {selectedBeneficiary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <User className="h-4 w-4" />
                    <span>Full Name</span>
                  </div>
                  <p className="font-medium">{selectedBeneficiary.name}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Building2 className="h-4 w-4" />
                    <span>Organization</span>
                  </div>
                  <p className="font-medium">
                    {selectedBeneficiary.organization || 'Individual'}
                  </p>
                  {selectedBeneficiary.organization_type && (
                    <Badge variant="outline" className="mt-1">
                      {selectedBeneficiary.organization_type}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">{selectedBeneficiary.email}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </div>
                  <p className="font-medium">{selectedBeneficiary.phone}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>Address</span>
                </div>
                <p className="font-medium">{selectedBeneficiary.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Registration Date</span>
                  </div>
                  <p className="font-medium">
                    {new Date(selectedBeneficiary.registration_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Package className="h-4 w-4" />
                    <span>Last Distribution</span>
                  </div>
                  <p className="font-medium">
                    {selectedBeneficiary.last_distribution 
                      ? new Date(selectedBeneficiary.last_distribution).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'No distributions yet'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedBeneficiary.total_requests}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Seedlings Received</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedBeneficiary.total_seedlings_received.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedBeneficiary.notes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Notes</div>
                  <p className="text-sm bg-muted p-3 rounded">{selectedBeneficiary.notes}</p>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <Badge variant={selectedBeneficiary.status === 'active' ? 'default' : 'secondary'}>
                  {selectedBeneficiary.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
