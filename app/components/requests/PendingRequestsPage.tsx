"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
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
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface PendingRequest {
  id: number;
  beneficiary_name: string;
  email: string;
  phone: string;
  location: string;
  organization?: string;
  request_date: string;
  plant_type: string;
  quantity_requested: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export function PendingRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchQuery, filterType, requests]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      
      // Generate realistic dummy data for pending requests with species names
      const dummyRequests: PendingRequest[] = [
        {
          id: 1,
          beneficiary_name: 'Juan Dela Cruz',
          email: 'juan.delacruz@example.com',
          phone: '+63 917 123 4567',
          location: 'Barangay San Isidro, Antipolo City',
          organization: 'San Isidro Farmers Association',
          request_date: '2024-10-28',
          plant_type: 'Narra (Pterocarpus indicus)',
          quantity_requested: 500,
          purpose: 'Reforestation project for watershed protection',
          status: 'pending',
          notes: 'Community-led initiative with LGU support'
        },
        {
          id: 2,
          beneficiary_name: 'Maria Santos',
          email: 'maria.santos@gmail.com',
          phone: '+63 918 234 5678',
          location: 'Sitio Maligaya, Rodriguez, Rizal',
          request_date: '2024-10-29',
          plant_type: 'Mango (Mangifera indica)',
          quantity_requested: 200,
          purpose: 'Community orchard development',
          status: 'pending',
          notes: 'First-time beneficiary, verified by barangay'
        },
        {
          id: 3,
          beneficiary_name: 'Pedro Reyes',
          email: 'preyes@yahoo.com',
          phone: '+63 919 345 6789',
          location: 'Barangay Tanay, Tanay, Rizal',
          organization: 'Green Tanay Movement',
          request_date: '2024-10-29',
          plant_type: 'Santan (Ixora coccinea)',
          quantity_requested: 150,
          purpose: 'Beautification of public parks and roadways',
          status: 'pending'
        },
        {
          id: 4,
          beneficiary_name: 'Linda Garcia',
          email: 'linda.garcia@school.edu.ph',
          phone: '+63 920 456 7890',
          location: 'Morong National High School, Morong, Rizal',
          organization: 'Morong NHS',
          request_date: '2024-10-30',
          plant_type: 'Mahogany (Swietenia macrophylla)',
          quantity_requested: 300,
          purpose: 'School tree planting activity and environmental education',
          status: 'pending',
          notes: 'Annual arbor day celebration'
        },
        {
          id: 5,
          beneficiary_name: 'Roberto Cruz',
          email: 'rob.cruz@barangay.gov.ph',
          phone: '+63 921 567 8901',
          location: 'Barangay Hall, Pililla, Rizal',
          organization: 'Barangay Pililla LGU',
          request_date: '2024-10-30',
          plant_type: 'Calamansi (Citrus microcarpa)',
          quantity_requested: 400,
          purpose: 'Urban agriculture program for food security',
          status: 'pending',
          notes: 'Part of government poverty alleviation program'
        },
        {
          id: 6,
          beneficiary_name: 'Ana Mercado',
          email: 'ana.mercado@ngo.org',
          phone: '+63 922 678 9012',
          location: 'Baras, Rizal',
          organization: 'Baras Environmental Foundation',
          request_date: '2024-10-31',
          plant_type: 'Acacia (Acacia mangium)',
          quantity_requested: 600,
          purpose: 'Slope protection and erosion control project',
          status: 'pending',
          notes: 'Critical area identified by DENR'
        },
        {
          id: 7,
          beneficiary_name: 'Carlos Fernandez',
          email: 'carlos.f@gmail.com',
          phone: '+63 923 789 0123',
          location: 'Teresa, Rizal',
          request_date: '2024-10-31',
          plant_type: 'Bougainvillea (Bougainvillea spectabilis)',
          quantity_requested: 100,
          purpose: 'Private garden and landscaping',
          status: 'pending'
        },
        {
          id: 8,
          beneficiary_name: 'Elena Ramos',
          email: 'elena.ramos@cooperative.ph',
          phone: '+63 924 890 1234',
          location: 'Cardona Multi-Purpose Cooperative, Cardona, Rizal',
          organization: 'Cardona MPC',
          request_date: '2024-10-31',
          plant_type: 'Avocado (Persea americana)',
          quantity_requested: 350,
          purpose: 'Livelihood project for cooperative members',
          status: 'pending',
          notes: 'With financial assistance from DTI'
        },
        {
          id: 9,
          beneficiary_name: 'Francisco Torres',
          email: 'ftorres@church.org',
          phone: '+63 925 901 2345',
          location: 'San Mateo Parish Church, San Mateo, Rizal',
          organization: 'San Mateo Parish',
          request_date: '2024-10-31',
          plant_type: 'Rosal (Rosa spp.)',
          quantity_requested: 80,
          purpose: 'Church grounds beautification',
          status: 'pending'
        },
        {
          id: 10,
          beneficiary_name: 'Grace Villanueva',
          email: 'grace.v@upland.org',
          phone: '+63 926 012 3456',
          location: 'Sitio Cambantoc, Cainta, Rizal',
          organization: 'Upland Development Program',
          request_date: '2024-10-31',
          plant_type: 'Gmelina (Gmelina arborea)',
          quantity_requested: 450,
          purpose: 'Agroforestry and livelihood enhancement',
          status: 'pending',
          notes: 'Indigenous community beneficiaries'
        },
        {
          id: 11,
          beneficiary_name: 'Henry Bautista',
          email: 'hbautista@resort.com',
          phone: '+63 927 123 4567',
          location: 'Mountain Resort, Tanay, Rizal',
          request_date: '2024-10-31',
          plant_type: 'Hibiscus (Hibiscus rosa-sinensis)',
          quantity_requested: 200,
          purpose: 'Resort landscaping and eco-tourism development',
          status: 'pending'
        },
        {
          id: 12,
          beneficiary_name: 'Isabel Santiago',
          email: 'isabel.santiago@youth.org',
          phone: '+63 928 234 5678',
          location: 'SK Federation Office, Binangonan, Rizal',
          organization: 'Binangonan SK Federation',
          request_date: '2024-10-31',
          plant_type: 'Guava (Psidium guajava)',
          quantity_requested: 250,
          purpose: 'Youth-led environmental project',
          status: 'pending',
          notes: 'SK fund allocated for this project'
        }
      ];
      
      setRequests(dummyRequests);
      setFilteredRequests(dummyRequests);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(req => 
        req.beneficiary_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.organization && req.organization.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by plant type category
    if (filterType !== 'all') {
      filtered = filtered.filter(req => {
        if (filterType === 'Forestry') {
          return req.plant_type.includes('Narra') || 
                 req.plant_type.includes('Mahogany') || 
                 req.plant_type.includes('Acacia') || 
                 req.plant_type.includes('Gmelina');
        } else if (filterType === 'Fruit Tree') {
          return req.plant_type.includes('Mango') || 
                 req.plant_type.includes('Calamansi') || 
                 req.plant_type.includes('Avocado') || 
                 req.plant_type.includes('Guava');
        } else if (filterType === 'Ornamental') {
          return req.plant_type.includes('Santan') || 
                 req.plant_type.includes('Bougainvillea') || 
                 req.plant_type.includes('Rosal') || 
                 req.plant_type.includes('Hibiscus');
        }
        return false;
      });
    }

    setFilteredRequests(filtered);
  };

  const handleViewDetails = (request: PendingRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleApprove = (request: PendingRequest) => {
    setSelectedRequest(request);
    setIsApproveOpen(true);
  };

  const handleReject = (request: PendingRequest) => {
    setSelectedRequest(request);
    setIsRejectOpen(true);
  };

  const confirmApprove = () => {
    if (selectedRequest) {
      // TODO: API call to approve request
      console.log('Approving request:', selectedRequest.id);
      setRequests(requests.filter(r => r.id !== selectedRequest.id));
      setIsApproveOpen(false);
      setSelectedRequest(null);
    }
  };

  const confirmReject = () => {
    if (selectedRequest) {
      // TODO: API call to reject request
      console.log('Rejecting request:', selectedRequest.id);
      setRequests(requests.filter(r => r.id !== selectedRequest.id));
      setIsRejectOpen(false);
      setSelectedRequest(null);
    }
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
        <h1 className="text-3xl font-bold">Pending Requests</h1>
        <p className="text-muted-foreground">Review and manage seedling distribution requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.reduce((sum, req) => sum + req.quantity_requested, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Forestry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => 
                r.plant_type.includes('Narra') || 
                r.plant_type.includes('Mahogany') || 
                r.plant_type.includes('Acacia') || 
                r.plant_type.includes('Gmelina')
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fruit Trees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => 
                r.plant_type.includes('Mango') || 
                r.plant_type.includes('Calamansi') || 
                r.plant_type.includes('Avocado') || 
                r.plant_type.includes('Guava')
              ).length}
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
                placeholder="Search by name, location, email, or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Forestry">Forestry</SelectItem>
                <SelectItem value="Fruit Tree">Fruit Tree</SelectItem>
                <SelectItem value="Ornamental">Ornamental</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beneficiary</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.beneficiary_name}</div>
                          {request.organization && (
                            <div className="text-sm text-muted-foreground">{request.organization}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{request.location}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          request.plant_type === 'Forestry' ? 'default' :
                          request.plant_type === 'Fruit Tree' ? 'secondary' :
                          'outline'
                        }>
                          {request.plant_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {request.quantity_requested.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(request.request_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(request)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(request)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
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
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this seedling distribution request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Beneficiary</span>
                  </div>
                  <p className="font-medium">{selectedRequest.beneficiary_name}</p>
                  {selectedRequest.organization && (
                    <p className="text-sm text-muted-foreground">{selectedRequest.organization}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Request Date</span>
                  </div>
                  <p className="font-medium">
                    {new Date(selectedRequest.request_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </div>
                  <p className="font-medium">{selectedRequest.phone}</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </div>
                  <p className="font-medium">{selectedRequest.location}</p>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Plant Type</div>
                  <Badge variant="default">{selectedRequest.plant_type}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Quantity Requested</div>
                  <p className="font-medium text-xl">{selectedRequest.quantity_requested.toLocaleString()} plants</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="text-sm text-muted-foreground">Purpose</div>
                  <p className="font-medium">{selectedRequest.purpose}</p>
                </div>

                {selectedRequest.notes && (
                  <div className="space-y-2 md:col-span-2">
                    <div className="text-sm text-muted-foreground">Additional Notes</div>
                    <p className="text-sm">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            <Button variant="destructive" onClick={() => {
              setIsDetailsOpen(false);
              if (selectedRequest) handleReject(selectedRequest);
            }}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={() => {
              setIsDetailsOpen(false);
              if (selectedRequest) handleApprove(selectedRequest);
            }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this request?
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <p className="font-medium">{selectedRequest.beneficiary_name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedRequest.quantity_requested.toLocaleString()} {selectedRequest.plant_type} plants
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <p className="font-medium">{selectedRequest.beneficiary_name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedRequest.quantity_requested.toLocaleString()} {selectedRequest.plant_type} plants
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
