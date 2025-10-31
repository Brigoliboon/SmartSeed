"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Plus, Loader2, Calendar } from "lucide-react";
import { NewRequestForm } from "./NewRequestForm";
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

interface RequestItem {
  id: number;
  request_code: string;
  beneficiary: string;
  contact: string;
  total_quantity: number;
  hectarage: string;
  date: string;
  status: string;
}

export function SeedlingRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [selected, setSelected] = useState<RequestItem | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [scheduledReleaseDate, setScheduledReleaseDate] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [showMonitoringDialog, setShowMonitoringDialog] = useState(false);
  const [monitoringScheduleDate, setMonitoringScheduleDate] = useState<string>("");

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seedling-requests");
      const data = await res.json();
      if (res.ok && data.success) {
        const mapped = data.requests.map((r: any) => ({
          id: r.id,
          request_code: r.request_code,
          beneficiary:
            r.beneficiary_name ||
            (r.beneficiary && r.beneficiary.full_name) ||
            "Unknown",
          contact:
            r.contact_number ||
            (r.beneficiary && r.beneficiary.contact_number) ||
            "",
          total_quantity: r.total_quantity || 0,
          hectarage: r.hectarage ? `${r.hectarage} ha` : "",
          date: r.date_submitted || r.created_at,
          status: r.status || "pending",
        }));
        setRequests(mapped);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Error loading requests", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSubmitReview = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const payload: any = {
        action,
        review_notes: reviewNotes || undefined,
      };
      if (action === "approve" && scheduledReleaseDate) {
        payload.scheduled_release_date = scheduledReleaseDate;
      }

      const res = await fetch(`/api/seedling-requests/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewOpen(false);
        setSelected(null);
        loadRequests();
      } else {
        console.error("Failed to update request", data);
        alert(data?.error || "Failed to update request");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating the request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleMonitoring = async () => {
    if (!selected || !monitoringScheduleDate) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/monitoring/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: selected.id,
          scheduled_date: monitoringScheduleDate,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowMonitoringDialog(false);
        setSelected(null);
        setMonitoringScheduleDate("");
        alert("Monitoring visit scheduled successfully!");
      } else {
        alert(data?.error || "Failed to schedule monitoring visit");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while scheduling");
    } finally {
      setSubmitting(false);
    }
  };

  if (showNewRequest) {
    return (
      <div className="space-y-6">
        <NewRequestForm
          onSuccess={() => {
            setShowNewRequest(false);
            loadRequests();
          }}
          onCancel={() => setShowNewRequest(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Seedling Requests</h1>
          <p className="text-muted-foreground text-lg">
            Manage beneficiary applications
          </p>
        </div>
        <Button
          onClick={() => setShowNewRequest(true)}
          size="lg"
          className="w-full sm:w-auto h-12 text-base"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Request
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading requests...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Review Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Pending Review (
                {requests.filter((r) => r.status === "pending").length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-sm text-muted-foreground">
                    <tr>
                      <th className="py-3">Request Code</th>
                      <th className="py-3">Beneficiary</th>
                      <th className="py-3">Contact</th>
                      <th className="py-3">Total Quantity</th>
                      <th className="py-3">Hectarage</th>
                      <th className="py-3">Date</th>
                      <th className="py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) =>
                      r.status === "pending" ? (
                        <tr key={r.id} className="border-t">
                          <td className="py-4">{r.request_code}</td>
                          <td className="py-4">{r.beneficiary}</td>
                          <td className="py-4">{r.contact}</td>
                          <td className="py-4">{r.total_quantity}</td>
                          <td className="py-4">{r.hectarage}</td>
                          <td className="py-4">{r.date}</td>
                          <td className="py-4">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelected(r);
                                setAction("approve");
                                setScheduledReleaseDate("");
                                setReviewNotes("");
                                setReviewOpen(true);
                              }}
                            >
                              Review
                            </Button>
                          </td>
                        </tr>
                      ) : null
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* All Requests Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">All Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-sm text-muted-foreground">
                    <tr>
                      <th className="py-3">Request Code</th>
                      <th className="py-3">Beneficiary</th>
                      <th className="py-3">Quantity</th>
                      <th className="py-3">Hectarage</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Date</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-t hover:bg-green-50">
                        <td className="py-4">{r.request_code}</td>
                        <td className="py-4">
                          {r.beneficiary}
                          <div className="text-sm text-muted-foreground">
                            {r.contact}
                          </div>
                        </td>
                        <td className="py-4">{r.total_quantity}</td>
                        <td className="py-4">{r.hectarage}</td>
                        <td className="py-4">
                          <Badge
                            className="capitalize"
                            variant={
                              r.status === "approved"
                                ? "default"
                                : r.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-4">
                          {new Date(r.date).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          {r.status === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelected(r);
                                setMonitoringScheduleDate("");
                                setShowMonitoringDialog(true);
                              }}
                            >
                              <Calendar className="w-4 h-4 mr-1" />
                              Schedule Visit
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Review Dialog */}
          <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Review Seedling Request</DialogTitle>
                <DialogDescription>
                  Review the request details and approve or reject. Approving
                  allows you to set a scheduled release date.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="text-sm font-medium">Request</div>
                  <div className="text-sm text-muted-foreground">
                    {selected ? `${selected.request_code} — ${selected.beneficiary}` : ""}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Action</Label>
                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-1 rounded-md border ${
                        action === "approve"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      onClick={() => setAction("approve")}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className={`px-3 py-1 rounded-md border ${
                        action === "reject"
                          ? "bg-destructive text-destructive-foreground"
                          : ""
                      }`}
                      onClick={() => setAction("reject")}
                      type="button"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {action === "approve" && (
                  <div className="grid gap-2">
                    <Label>Scheduled Release Date</Label>
                    <Input
                      type="date"
                      value={scheduledReleaseDate}
                      onChange={(e) => setScheduledReleaseDate(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Optional notes about the review"
                  />
                </div>
              </div>

              <DialogFooter>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setReviewOpen(false);
                      setSelected(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitReview} disabled={submitting}>
                    {submitting
                      ? "Saving..."
                      : action === "approve"
                      ? "Approve Request"
                      : "Reject Request"}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Schedule Monitoring Dialog */}
          <Dialog open={showMonitoringDialog} onOpenChange={setShowMonitoringDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Monitoring Visit</DialogTitle>
                <DialogDescription>
                  Schedule a post-planting site visit to monitor seedlings
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="text-sm font-medium">Request</div>
                  <div className="text-sm text-muted-foreground">
                    {selected ? `${selected.request_code} — ${selected.beneficiary}` : ""}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Scheduled Visit Date</Label>
                  <Input
                    type="date"
                    value={monitoringScheduleDate}
                    onChange={(e) => setMonitoringScheduleDate(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowMonitoringDialog(false);
                    setSelected(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleScheduleMonitoring} disabled={submitting}>
                  {submitting ? "Scheduling..." : "Schedule Visit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
