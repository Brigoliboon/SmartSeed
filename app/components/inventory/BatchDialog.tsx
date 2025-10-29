import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PlantBatch } from '../../types';

interface BatchDialogProps {
  batch: PlantBatch | null;
  onClose: () => void;
  onSave: (batch: PlantBatch) => void;
}

export function BatchDialog({ batch, onClose, onSave }: BatchDialogProps) {
  const [formData, setFormData] = useState<Partial<PlantBatch>>({
    batch_code: '',
    species_name: '',
    common_name: '',
    quantity: 0,
    status: 'germinating',
    health_status: 'good',
    date_planted: new Date().toISOString().split('T')[0],
    estimated_ready_date: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    if (batch) {
      setFormData(batch);
    }
  }, [batch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: batch?.id || Date.now().toString(),
      created_at: batch?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as PlantBatch);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{batch ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
          <DialogDescription>
            {batch ? 'Update the batch information below' : 'Enter the details for the new plant batch'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch_code">Batch Code *</Label>
              <Input
                id="batch_code"
                value={formData.batch_code}
                onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
                placeholder="MNG-2024-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                placeholder="500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="species_name">Species Name *</Label>
            <Input
              id="species_name"
              value={formData.species_name}
              onChange={(e) => setFormData({ ...formData, species_name: e.target.value })}
              placeholder="Swietenia macrophylla"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="common_name">Common Name *</Label>
            <Input
              id="common_name"
              value={formData.common_name}
              onChange={(e) => setFormData({ ...formData, common_name: e.target.value })}
              placeholder="Mahogany"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as PlantBatch['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="germinating">Germinating</SelectItem>
                  <SelectItem value="growing">Growing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="distributed">Distributed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="health_status">Health Status *</Label>
              <Select 
                value={formData.health_status} 
                onValueChange={(value) => setFormData({ ...formData, health_status: value as PlantBatch['health_status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_planted">Date Planted *</Label>
              <Input
                id="date_planted"
                type="date"
                value={formData.date_planted}
                onChange={(e) => setFormData({ ...formData, date_planted: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_ready_date">Estimated Ready Date</Label>
              <Input
                id="estimated_ready_date"
                type="date"
                value={formData.estimated_ready_date}
                onChange={(e) => setFormData({ ...formData, estimated_ready_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Greenhouse A-1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this batch..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {batch ? 'Update Batch' : 'Create Batch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
