"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar, MapPin, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
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

interface MonitoringVisit {
  visit_id: number;
  site_id: number;
  request_code: string;
  beneficiary_name: string;
  contact_number: string;
  planting_site_address: string;
  scheduled_date: string;
  attempted_messages: number;
  beneficiary_confirmed: boolean;
  visit_date: string | null;
  result: string | null;
  notes: string | null;
  blacklisted: boolean;
}

export function MonitoringPage() {
  const [visits, setVisits] = useState<MonitoringVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<MonitoringVisit | null>(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Record visit form
  const [visitResult, setVisitResult] = useState<string>("planted_successful");
  const [visitNotes, setVisitNotes] = useState("");
  const [gpsLat, setGpsLat] = useState("");
  const [gpsLong, setGpsLong] = useState("");
  const [shouldBlacklist, setShouldBlacklist] = useState(false);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/monitoring/visits");
      const data = await res.json();
      if (res.ok && data.success) {
        setVisits(data.visits || []);
      }
    } catch (err) {
      console.error("Error loading visits", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const handleSendSMS = async () => {
    if (!selectedVisit) return;
    setSubmitting(true);
    try {
      // Send SMS
      await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_number: selectedVisit.contact_number,
          message_text: `Hello ${selectedVisit.beneficiary_name}, we would like to schedule a site visit on ${new Date(selectedVisit.scheduled_date).toLocaleDateString()}. Please reply YES to confirm.`,
          attempt: selectedVisit.attempted_messages + 1,
        }),
      });

      // Update visit attempted messages
      await fetch(`/api/monitoring/visits/${selectedVisit.visit_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempted_messages: selectedVisit.attempted_messages + 1,
        }),
      });

      setShowSMSDialog(false);
      loadVisits();
      alert("SMS sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send SMS");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordVisit = async () => {
    if (!selectedVisit) return;
    setSubmitting(true);
    try {
      const payload: any = {
        visit_date: new Date().toISOString(),
        result: visitResult,
        notes: visitNotes || undefined,
      };

      if (visitResult === "planted_successful" && gpsLat && gpsLong) {
        payload.gps_latitude = parseFloat(gpsLat);
        payload.gps_longitude = parseFloat(gpsLong);
      }

      if (shouldBlacklist) {
        payload.blacklisted = true;
      }

      await fetch(`/api/monitoring/visits/${selectedVisit.visit_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setShowRecordDialog(false);
      setSelectedVisit(null);
      loadVisits();
      alert("Visit recorded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to record visit");
    } finally {
      setSubmitting(false);
    }
  };

  const getGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLat(position.coords.latitude.toString());
          setGpsLong(position.coords.longitude.toString());
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get GPS location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Post-Planting Monitoring</h1>
        <p className="text-muted-foreground text-lg">
          Schedule and conduct site visits to monitor planted seedlings
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">Loading...</div>
      ) : (
        <div className="space-y-6">
          {/* Pending Visits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Scheduled Visits ({visits.filter((v) => !v.visit_date).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-sm text-muted-foreground">
                    <tr>
                      <th className="py-3">Request</th>
                      <th className="py-3">Beneficiary</th>
                      <th className="py-3">Scheduled Date</th>
                      <th className="py-3">SMS Attempts</th>
                      <th className="py-3">Confirmed</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits
                      .filter((v) => !v.visit_date)
                      .map((v) => (
                        <tr key={v.visit_id} className="border-t">
                          <td className="py-4">{v.request_code}</td>
                          <td className="py-4">
                            {v.beneficiary_name}
                            <div className="text-sm text-muted-foreground">
                              {v.contact_number}
                            </div>
                          </td>
                          <td className="py-4">
                            {new Date(v.scheduled_date).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            {v.attempted_messages}
                            {v.attempted_messages >= 3 && (
                              <AlertTriangle className="inline w-4 h-4 ml-2 text-orange-600" />
                            )}
                          </td>
                          <td className="py-4">
                            {v.beneficiary_confirmed ? (
                              <Badge variant="default">Confirmed</Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedVisit(v);
                                  setShowSMSDialog(true);
                                }}
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Send SMS
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedVisit(v);
                                  setVisitResult("planted_successful");
                                  setVisitNotes("");
                                  setGpsLat("");
                                  setGpsLong("");
                                  setShouldBlacklist(false);
                                  setShowRecordDialog(true);
                                }}
                              >
                                Record Visit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Completed Visits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Completed Visits ({visits.filter((v) => v.visit_date).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-sm text-muted-foreground">
                    <tr>
                      <th className="py-3">Request</th>
                      <th className="py-3">Beneficiary</th>
                      <th className="py-3">Visit Date</th>
                      <th className="py-3">Result</th>
                      <th className="py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits
                      .filter((v) => v.visit_date)
                      .map((v) => (
                        <tr key={v.visit_id} className="border-t">
                          <td className="py-4">{v.request_code}</td>
                          <td className="py-4">{v.beneficiary_name}</td>
                          <td className="py-4">
                            {new Date(v.visit_date!).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <Badge
                              variant={
                                v.result === "planted_successful"
                                  ? "default"
                                  : "destructive"
                              }
                              className="capitalize"
                            >
                              {v.result?.replace("_", " ")}
                            </Badge>
                            {v.blacklisted && (
                              <Badge variant="destructive" className="ml-2">
                                Blacklisted
                              </Badge>
                            )}
                          </td>
                          <td className="py-4">{v.notes || "-"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SMS Dialog */}
      <Dialog open={showSMSDialog} onOpenChange={setShowSMSDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send SMS Confirmation</DialogTitle>
            <DialogDescription>
              Send SMS to beneficiary to confirm the scheduled visit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <div className="text-sm font-medium">Beneficiary</div>
              <div className="text-sm text-muted-foreground">
                {selectedVisit?.beneficiary_name} - {selectedVisit?.contact_number}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Message Preview</div>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-2">
                Hello {selectedVisit?.beneficiary_name}, we would like to schedule
                a site visit on{" "}
                {new Date(selectedVisit?.scheduled_date || "").toLocaleDateString()}
                . Please reply YES to confirm.
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">
                Attempt #{(selectedVisit?.attempted_messages || 0) + 1}
              </div>
              {(selectedVisit?.attempted_messages || 0) >= 2 && (
                <div className="text-sm text-orange-600 flex items-center gap-2 mt-1">
                  <AlertTriangle className="w-4 h-4" />
                  After 3 attempts, please call the beneficiary directly
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowSMSDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendSMS} disabled={submitting}>
              {submitting ? "Sending..." : "Send SMS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Visit Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Site Visit</DialogTitle>
            <DialogDescription>
              Document the results of the site visit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <div className="text-sm font-medium">Request</div>
              <div className="text-sm text-muted-foreground">
                {selectedVisit?.request_code} - {selectedVisit?.beneficiary_name}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Visit Result</Label>
              <div className="flex gap-2 flex-wrap">
                <button
                  className={`px-3 py-2 rounded-md border ${
                    visitResult === "planted_successful"
                      ? "bg-green-600 text-white"
                      : ""
                  }`}
                  onClick={() => setVisitResult("planted_successful")}
                  type="button"
                >
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Successfully Planted
                </button>
                <button
                  className={`px-3 py-2 rounded-md border ${
                    visitResult === "not_planted"
                      ? "bg-red-600 text-white"
                      : ""
                  }`}
                  onClick={() => setVisitResult("not_planted")}
                  type="button"
                >
                  <AlertTriangle className="inline w-4 h-4 mr-1" />
                  Not Planted
                </button>
                <button
                  className={`px-3 py-2 rounded-md border ${
                    visitResult === "partial"
                      ? "bg-yellow-600 text-white"
                      : ""
                  }`}
                  onClick={() => setVisitResult("partial")}
                  type="button"
                >
                  Partially Planted
                </button>
              </div>
            </div>

            {visitResult === "planted_successful" && (
              <div className="grid gap-2">
                <Label>GPS Location (Geo-tagging)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Latitude"
                    value={gpsLat}
                    onChange={(e) => setGpsLat(e.target.value)}
                  />
                  <Input
                    placeholder="Longitude"
                    value={gpsLong}
                    onChange={(e) => setGpsLong(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getGPSLocation}
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="Visit observations and notes"
                rows={4}
              />
            </div>

            {visitResult === "not_planted" && (
              <div className="flex items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-md">
                <input
                  type="checkbox"
                  checked={shouldBlacklist}
                  onChange={(e) => setShouldBlacklist(e.target.checked)}
                  id="blacklist"
                />
                <label htmlFor="blacklist" className="text-sm">
                  Blacklist this beneficiary (seedlings were not planted)
                </label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowRecordDialog(false);
                setSelectedVisit(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRecordVisit} disabled={submitting}>
              {submitting ? "Recording..." : "Record Visit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
