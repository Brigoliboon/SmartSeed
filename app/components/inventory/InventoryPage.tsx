"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Plus, Search, Loader2, Calendar, MapPin, User, ImageIcon } from 'lucide-react';
import { AddBatchForm } from './AddBatchForm';

interface Batch {
  id: number;
  batch_id: string;
  date_received: string;
  source_location: string;
  photo_url: string | null;
  wildlings_count: number;
  notes: string | null;
  status: string;
  person_in_charge: string | null;
  created_at: string;
  updated_at: string;
}

export function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/batches');
      const data = await response.json();

      if (data.success) {
        setBatches(data.batches);
      } else {
        setError('Failed to load batches');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const filteredBatches = batches.filter(batch =>
    batch.batch_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.source_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (batch.person_in_charge && batch.person_in_charge.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'counted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'growing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <AddBatchForm
          onSuccess={() => {
            setShowAddForm(false);
            fetchBatches();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wildling Inventory</h1>
          <p className="text-muted-foreground text-lg">Manage wildling batches from receipt to distribution</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          size="lg"
          className="w-full sm:w-auto h-12 text-base"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Batch
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by batch ID, location, or person..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Batches</p>
              <p className="text-3xl font-bold">{batches.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Wildlings</p>
              <p className="text-3xl font-bold">
                {batches.reduce((sum, batch) => sum + batch.wildlings_count, 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Received Status</p>
              <p className="text-3xl font-bold">
                {batches.filter(b => b.status === 'received').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading batches...</span>
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
          {filteredBatches.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground text-lg py-8">
                  {searchQuery ? 'No batches found matching your search' : 'No batches yet. Add your first batch!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredBatches.map((batch) => (
              <Card key={batch.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{batch.batch_id}</CardTitle>
                    <Badge className={'${getStatusColor(batch.status)} capitalize'}>
                      {batch.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {batch.photo_url ? (
                    <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={batch.photo_url}
                        alt={'Batch '}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">Received</p>
                        <p className="font-medium">{formatDate(batch.date_received)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">Source</p>
                        <p className="font-medium">{batch.source_location}</p>
                      </div>
                    </div>

                    {batch.person_in_charge && (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-muted-foreground">Person in Charge</p>
                          <p className="font-medium">{batch.person_in_charge}</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <p className="text-2xl font-bold text-center">
                        {batch.wildlings_count.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground ml-2">wildlings</span>
                      </p>
                    </div>

                    {batch.notes && (
                      <div className="text-sm bg-muted/50 p-3 rounded-lg">
                        <p className="text-muted-foreground mb-1">Notes:</p>
                        <p>{batch.notes}</p>
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
