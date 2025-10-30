"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AddBatchFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddBatchForm({ onSuccess, onCancel }: AddBatchFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    source_location: '',
    wildlings_count: '',
    notes: '',
    person_in_charge: '',
    photo_url: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string>('');

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploadingPhoto(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('photo', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, photo_url: data.photo_url });
      } else {
        setError('Failed to upload photo');
      }
    } catch (err) {
      setError('Error uploading photo');
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.source_location.trim()) {
      setError('Source location is required');
      setLoading(false);
      return;
    }

    if (!formData.wildlings_count || parseInt(formData.wildlings_count) <= 0) {
      setError('Please enter a valid number of wildlings');
      setLoading(false);
      return;
    }

    if (!formData.photo_url) {
      setError('Please upload a photo of the batch');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_location: formData.source_location,
          wildlings_count: parseInt(formData.wildlings_count),
          notes: formData.notes || null,
          person_in_charge: formData.person_in_charge || null,
          photo_url: formData.photo_url,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(data.error || 'Failed to create batch');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl mb-2">Batch Added Successfully!</h3>
            <p className="text-muted-foreground">Redirecting to inventory...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Wildling Batch</CardTitle>
        <CardDescription className="text-base">
          Fill out the form to register a new batch of wildlings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-generated fields info */}
          {/* Photo Upload - Priority */}
          <div className="space-y-3">
            <Label htmlFor="photo" className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Photo of Batch *
            </Label>
            
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Batch preview"
                  className="w-full h-64 object-cover rounded-lg border-2 border-border"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setPhotoPreview('');
                    setFormData({ ...formData, photo_url: '' });
                  }}
                >
                  Change Photo
                </Button>
              </div>
            ) : (
              <label
                htmlFor="photo"
                className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                <span className="text-lg mb-1">Tap to upload photo</span>
                <span className="text-sm text-muted-foreground">Required</span>
              </label>
            )}
            
            <input
              id="photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
              disabled={uploadingPhoto}
            />
            
            {uploadingPhoto && (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading photo...</span>
              </div>
            )}
          </div>

          {/* Source Location */}
          <div className="space-y-3">
            <Label htmlFor="source_location" className="text-lg">
              Source Location *
            </Label>
            <Input
              id="source_location"
              value={formData.source_location}
              onChange={(e) => setFormData({ ...formData, source_location: e.target.value })}
              placeholder="e.g., Mount Makiling Forest Reserve"
              className="text-lg h-12"
              required
            />
          </div>

          {/* Number of Wildlings */}
          <div className="space-y-3">
            <Label htmlFor="wildlings_count" className="text-lg">
              Number of Wildlings *
            </Label>
            <Input
              id="wildlings_count"
              type="number"
              min="1"
              value={formData.wildlings_count}
              onChange={(e) => setFormData({ ...formData, wildlings_count: e.target.value })}
              placeholder="e.g., 500"
              className="text-lg h-12"
              required
            />
          </div>

          {/* Person in Charge */}
          <div className="space-y-3">
            <Label htmlFor="person_in_charge" className="text-lg">
              Person in Charge
            </Label>
            <Input
              id="person_in_charge"
              value={formData.person_in_charge}
              onChange={(e) => setFormData({ ...formData, person_in_charge: e.target.value })}
              placeholder="e.g., Juan Dela Cruz"
              className="text-lg h-12"
            />
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-lg">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information about this batch..."
              className="text-base min-h-24"
              rows={4}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-14 text-lg"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-14 text-lg"
              disabled={loading || uploadingPhoto}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Adding Batch...
                </>
              ) : (
                'Add Batch'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
