"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Plus, Search, Filter, Download, Eye } from 'lucide-react';
import { PlantBatch } from '../../types';
import { BatchDialog } from './BatchDialog';

export function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<PlantBatch | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Mock data
  const [batches, setBatches] = useState<PlantBatch[]>([
    {
      id: '1',
      batch_code: 'MNG-2024-001',
      species_name: 'Swietenia macrophylla',
      common_name: 'Mahogany',
      quantity: 500,
      status: 'ready',
      health_status: 'excellent',
      date_planted: '2024-01-15',
      estimated_ready_date: '2024-10-15',
      location: 'Greenhouse A-1',
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-10-28T10:00:00Z',
    },
    {
      id: '2',
      batch_code: 'MNG-2024-002',
      species_name: 'Dipterocarpus grandiflorus',
      common_name: 'Apitong',
      quantity: 750,
      status: 'growing',
      health_status: 'good',
      date_planted: '2024-03-20',
      estimated_ready_date: '2024-12-20',
      location: 'Greenhouse A-2',
      created_at: '2024-03-20T08:00:00Z',
      updated_at: '2024-10-28T10:00:00Z',
    },
    {
      id: '3',
      batch_code: 'MNG-2024-003',
      species_name: 'Pterocarpus indicus',
      common_name: 'Narra',
      quantity: 1200,
      status: 'growing',
      health_status: 'excellent',
      date_planted: '2024-02-10',
      estimated_ready_date: '2024-11-10',
      location: 'Greenhouse B-1',
      created_at: '2024-02-10T08:00:00Z',
      updated_at: '2024-10-28T10:00:00Z',
    },
    {
      id: '4',
      batch_code: 'MNG-2024-004',
      species_name: 'Shorea contorta',
      common_name: 'White Lauan',
      quantity: 600,
      status: 'germinating',
      health_status: 'good',
      date_planted: '2024-09-01',
      estimated_ready_date: '2025-06-01',
      location: 'Greenhouse C-1',
      created_at: '2024-09-01T08:00:00Z',
      updated_at: '2024-10-28T10:00:00Z',
    },
  ]);

  const filteredBatches = batches.filter(batch =>
    batch.batch_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.species_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.common_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeVariant = (status: PlantBatch['status']) => {
    switch (status) {
      case 'ready':
        return 'default';
      case 'growing':
        return 'secondary';
      case 'germinating':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getHealthBadgeColor = (health: PlantBatch['health_status']) => {
    switch (health) {
      case 'excellent':
        return 'bg-primary/10 text-primary';
      case 'good':
        return 'bg-chart-2/10 text-chart-2';
      case 'fair':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Inventory Management</h1>
          <p className="text-muted-foreground">Manage plant batches and track growth progress</p>
        </div>
        <Button onClick={() => {
          setSelectedBatch(null);
          setShowDialog(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Batch
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by batch code, species, or common name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBatches.map((batch) => (
          <Card key={batch.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{batch.batch_code}</CardTitle>
                  <CardDescription className="italic">{batch.species_name}</CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(batch.status)} className="capitalize">
                  {batch.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2">{batch.common_name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Health:</span>
                  <Badge className={`capitalize ${getHealthBadgeColor(batch.health_status)}`}>
                    {batch.health_status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Quantity</p>
                  <p>{batch.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p>{batch.location}</p>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground">Planted</p>
                <p>{new Date(batch.date_planted).toLocaleDateString()}</p>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSelectedBatch(batch);
                  setShowDialog(true);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Batch Dialog */}
      {showDialog && (
        <BatchDialog
          batch={selectedBatch}
          onClose={() => setShowDialog(false)}
          onSave={(batch) => {
            if (selectedBatch) {
              // Update existing
              setBatches(batches.map(b => b.id === batch.id ? batch : b));
            } else {
              // Add new
              setBatches([...batches, { ...batch, id: Date.now().toString() }]);
            }
            setShowDialog(false);
          }}
        />
      )}
    </div>
  );
}
