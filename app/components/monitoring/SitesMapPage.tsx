"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { MapPin, Loader2 } from "lucide-react";

interface MonitoringSite {
  site_id: number;
  request_id: number;
  request_code: string;
  site_name: string | null;
  gps_latitude: number;
  gps_longitude: number;
  species_summary: any;
  beneficiary_name: string;
  planting_site_address: string;
}

export function SitesMapPage() {
  const [sites, setSites] = useState<MonitoringSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<MonitoringSite | null>(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/monitoring/sites");
      const data = await res.json();
      if (res.ok && data.success) {
        setSites(data.sites || []);
      }
    } catch (err) {
      console.error("Error loading sites", err);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading sites...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Geotagged Planting Sites</h1>
        <p className="text-muted-foreground text-lg">
          View all monitored planting sites with GPS coordinates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sites List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Monitored Sites ({sites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {sites.map((site) => (
                <div
                  key={site.site_id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-green-50 transition ${
                    selectedSite?.site_id === site.site_id
                      ? "bg-green-50 border-green-500"
                      : ""
                  }`}
                  onClick={() => setSelectedSite(site)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        {site.request_code}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {site.beneficiary_name}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        {site.planting_site_address}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        GPS: {site.gps_latitude.toFixed(6)},{" "}
                        {site.gps_longitude.toFixed(6)}
                      </div>
                    </div>
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              ))}
              {sites.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No geotagged sites yet. Complete site visits to add locations.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Site Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Site Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSite ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Request Code
                  </div>
                  <div className="text-lg font-semibold">
                    {selectedSite.request_code}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Beneficiary
                  </div>
                  <div className="text-lg">{selectedSite.beneficiary_name}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Planting Site Address
                  </div>
                  <div className="text-lg">
                    {selectedSite.planting_site_address}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    GPS Coordinates
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      Lat: {selectedSite.gps_latitude.toFixed(6)}
                    </Badge>
                    <Badge variant="secondary">
                      Lng: {selectedSite.gps_longitude.toFixed(6)}
                    </Badge>
                  </div>
                  <button
                    onClick={() =>
                      openInMaps(
                        selectedSite.gps_latitude,
                        selectedSite.gps_longitude
                      )
                    }
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Open in Google Maps
                  </button>
                </div>

                {selectedSite.species_summary && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Species Planted
                    </div>
                    <div className="space-y-2">
                      {Object.entries(selectedSite.species_summary).map(
                        ([species, count]) => (
                          <div
                            key={species}
                            className="flex justify-between items-center p-2 bg-green-50 rounded-md"
                          >
                            <span className="font-medium">{species}</span>
                            <Badge>{count as number} seedlings</Badge>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Simple Map Placeholder */}
                <div className="mt-6">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Location Preview
                  </div>
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto text-green-600 mb-2" />
                      <div className="text-sm text-muted-foreground">
                        Interactive map can be integrated using
                        <br />
                        Google Maps API or Leaflet.js
                      </div>
                      <button
                        onClick={() =>
                          openInMaps(
                            selectedSite.gps_latitude,
                            selectedSite.gps_longitude
                          )
                        }
                        className="mt-3 text-sm text-blue-600 hover:underline"
                      >
                        View on Google Maps →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Select a site from the list to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {sites.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Geotagged Sites
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {sites.reduce((total, site) => {
                  if (site.species_summary) {
                    return (
                      total +
                      Object.values(site.species_summary).reduce(
                        (a: any, b: any) => a + b,
                        0
                      )
                    );
                  }
                  return total;
                }, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Seedlings Planted
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {
                  new Set(
                    sites.flatMap((site) =>
                      site.species_summary
                        ? Object.keys(site.species_summary)
                        : []
                    )
                  ).size
                }
              </div>
              <div className="text-sm text-muted-foreground">
                Unique Species Types
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
