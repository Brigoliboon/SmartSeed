"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Plus, Loader2, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface ApprovedRequest {
  id: number;
  request_code: string;
  beneficiary_name: string;
  total_quantity: number;
  scheduled_release_date: string;
  planting_site_address: string;
}

interface Release {
  id: number;
  request_code: string;
  beneficiary_name: string;
  quantity_released: number;
  release_date: string;
  released_by_name: string | null;
  notes: string | null;
}

export function ReleasesPage() {
  const [approvedRequests, setApprovedRequests] = useState<ApprovedRequest[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ApprovedRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Release form
  const [quantityReleased, setQuantityReleased] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [releaseDate, setReleaseDate] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch approved requests
      const reqRes = await fetch("/api/seedling-requests");
      const reqData = await reqRes.json();
      if (reqRes.ok && reqData.success) {
        const approved = reqData.requests.filter((r: any) => r.status === "approved");
        setApprovedRequests(
          approved.map((r: any) => ({
            id: r.id,
            request_code: r.request_code,
            beneficiary_name: r.beneficiary_name || "Unknown",
            total_quantity: r.total_quantity,
            scheduled_release_date: r.scheduled_release_date,
            planting_site_address: r.planting_site_address,
          }))
        );
      }

      // Fetch releases
      const relRes = await fetch("/api/releases");
      const relData = await relRes.json();
      if (relRes.ok && relData.success) {
        setReleases(relData.releases || []);
      }
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRelease = async () => {
    if (!selectedRequest) return;

    if (!quantityReleased || Number(quantityReleased) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        request_id: selectedRequest.id,
        quantity_released: Number(quantityReleased),
        notes: releaseNotes || undefined,
        release_date: releaseDate || undefined,
        released_by: 1, // TODO: Get from auth context
      };

      const res = await fetch("/api/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowReleaseDialog(false);
        setSelectedRequest(null);
        setQuantityReleased("");
        setReleaseNotes("");
        setReleaseDate("");
        loadData();
        alert("Release recorded successfully!");
      } else {
        alert(data.error || "Failed to create release");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seedling Releases & Distribution</h1>
        <p className="text-muted-foreground text-lg">
          Manage the distribution of approved seedling requests
        </p>
      </div>

      {/* Approved Requests Ready for Release */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Approved Requests - Ready for Distribution ({approvedRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-muted-foreground">
                <tr>
                  <th className="py-3">Request Code</th>
                  <th className="py-3">Beneficiary</th>
                  <th className="py-3">Quantity</th>
                  <th className="py-3">Scheduled Release</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {approvedRequests.map((req) => (
                  <tr key={req.id} className="border-t">
                    <td className="py-4">{req.request_code}</td>
                    <td className="py-4">{req.beneficiary_name}</td>
                    <td className="py-4">{req.total_quantity} seedlings</td>
                    <td className="py-4">
                      {req.scheduled_release_date
                        ? new Date(req.scheduled_release_date).toLocaleDateString()
                        : "Not scheduled"}
                    </td>
                    <td className="py-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(req);
                          setQuantityReleased(req.total_quantity.toString());
                          setReleaseDate(
                            req.scheduled_release_date
                              ? new Date(req.scheduled_release_date).toISOString().split("T")[0]
                              : new Date().toISOString().split("T")[0]
                          );
                          setReleaseNotes("");
                          setShowReleaseDialog(true);
                        }}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Release
                      </Button>
                    </td>
                  </tr>
                ))}
                {approvedRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No approved requests awaiting distribution
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Release History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Release History ({releases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-muted-foreground">
                <tr>
                  <th className="py-3">Request Code</th>
                  <th className="py-3">Beneficiary</th>
                  <th className="py-3">Quantity Released</th>
                  <th className="py-3">Release Date</th>
                  <th className="py-3">Released By</th>
                  <th className="py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {releases.map((rel) => (
                  <tr key={rel.id} className="border-t hover:bg-green-50">
                    <td className="py-4">{rel.request_code}</td>
                    <td className="py-4">{rel.beneficiary_name}</td>
                    <td className="py-4">{rel.quantity_released} seedlings</td>
                    <td className="py-4">
                      {new Date(rel.release_date).toLocaleDateString()}
                    </td>
                    <td className="py-4">{rel.released_by_name || "-"}</td>
                    <td className="py-4">{rel.notes || "-"}</td>
                  </tr>
                ))}
                {releases.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No release records yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Release Dialog */}
      <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Seedling Release</DialogTitle>
            <DialogDescription>
              Record the distribution of seedlings to the beneficiary
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <div className="text-sm font-medium">Request</div>
              <div className="text-sm text-muted-foreground">
                {selectedRequest?.request_code} - {selectedRequest?.beneficiary_name}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Approved: {selectedRequest?.total_quantity} seedlings
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Quantity Released</Label>
              <Input
                type="number"
                value={quantityReleased}
                onChange={(e) => setQuantityReleased(e.target.value)}
                placeholder="Enter quantity"
                min="1"
                max={selectedRequest?.total_quantity}
              />
            </div>

            <div className="grid gap-2">
              <Label>Release Date</Label>
              <Input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                placeholder="Optional notes about the release"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowReleaseDialog(false);
                setSelectedRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRelease} disabled={submitting}>
              {submitting ? "Recording..." : "Record Release"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
