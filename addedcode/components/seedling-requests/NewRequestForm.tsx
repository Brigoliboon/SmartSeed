"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

interface NewRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewRequestForm({ onSuccess, onCancel }: NewRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    contact_number: "",
    email: "",
    address: "",
    planting_site: "",
    hectarage: "",
    species: "",
    quantity: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Minimal validation
    if (
      !formData.full_name.trim() ||
      !formData.contact_number.trim() ||
      !formData.planting_site.trim()
    ) {
      setError("Full name, contact number and planting site are required");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        beneficiary: {
          full_name: formData.full_name,
          address: formData.address,
          contact_number: formData.contact_number,
          email: formData.email,
        },
        planting_site_address: formData.planting_site,
        hectarage: parseFloat(formData.hectarage) || 0,
        species: [
          {
            species_name: formData.species || "Unknown",
            quantity: Number(formData.quantity) || 0,
          },
        ],
        submitted_by: null,
      };

      const res = await fetch("/api/seedling-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => onSuccess(), 900);
      } else {
        setError(data.error || "Failed to submit request");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl mb-2">Request Submitted!</h3>
            <p className="text-muted-foreground">
              Thank you — your request has been recorded.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">New Seedling Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="contact_number">Contact Number *</Label>
              <Input
                id="contact_number"
                value={formData.contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                placeholder="+63 XXX XXX XXXX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="planting_site">Planting Site Address *</Label>
              <Input
                id="planting_site"
                value={formData.planting_site}
                onChange={(e) =>
                  setFormData({ ...formData, planting_site: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="hectarage">Hectarage *</Label>
              <Input
                id="hectarage"
                value={formData.hectarage}
                onChange={(e) =>
                  setFormData({ ...formData, hectarage: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="species">Species *</Label>
            <Input
              id="species"
              value={formData.species}
              onChange={(e) =>
                setFormData({ ...formData, species: e.target.value })
              }
              placeholder="Select species"
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

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
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default NewRequestForm;
