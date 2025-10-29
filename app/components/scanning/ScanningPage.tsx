import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Camera, Upload, CheckCircle, AlertCircle, Leaf, Activity } from 'lucide-react';
import { ScanResult } from '../../types';

export function ScanningPage() {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate AI scanning process
    setScanning(true);
    setScanResult(null);
    setProgress(0);

    // Progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API call delay
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      // Mock scan result
      const mockResult: ScanResult = {
        id: Date.now().toString(),
        batch_id: 'BATCH-001',
        image_url: previewUrl,
        species_detected: 'Swietenia macrophylla',
        confidence: 0.92,
        health_assessment: 'healthy',
        recommendations: [
          'Maintain current watering schedule',
          'Monitor for early signs of leaf discoloration',
          'Optimal growth conditions detected',
          'Ready for transplanting in 2-3 weeks'
        ],
        timestamp: new Date().toISOString(),
        scanned_by: 'current_user',
      };

      setScanResult(mockResult);
      setScanning(false);
    }, 2500);
  };

  const handleNewScan = () => {
    setScanResult(null);
    setPreviewUrl('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>AI Plant Scanner</h1>
        <p className="text-muted-foreground">Identify species and assess plant health using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Upload Plant Image</CardTitle>
            <CardDescription>
              Take a photo or upload an image for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30">
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg object-contain"
                  />
                  {!scanning && !scanResult && (
                    <Button onClick={handleNewScan} variant="outline" size="sm">
                      Choose Different Image
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <p className="mb-2">No image selected</p>
                    <p className="text-sm text-muted-foreground">
                      Upload a clear photo of the plant for best results
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Scanning Progress */}
            {scanning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Analyzing image...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Upload Buttons */}
            {!scanning && !scanResult && (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={scanning}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Supports JPG, PNG up to 10MB
                </p>
              </div>
            )}

            {/* New Scan Button */}
            {scanResult && (
              <Button className="w-full" onClick={handleNewScan}>
                <Camera className="w-4 h-4 mr-2" />
                Scan Another Plant
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
            <CardDescription>
              AI-powered species identification and health assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!scanResult && !scanning && (
              <div className="text-center py-12 text-muted-foreground">
                <Leaf className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Upload an image to see scan results</p>
              </div>
            )}

            {scanning && (
              <div className="text-center py-12">
                <div className="animate-pulse space-y-4">
                  <Activity className="w-12 h-12 mx-auto text-primary" />
                  <p>Analyzing plant image...</p>
                  <p className="text-sm text-muted-foreground">
                    Detecting species and assessing health
                  </p>
                </div>
              </div>
            )}

            {scanResult && (
              <div className="space-y-6">
                {/* Species Detection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3>Species Detected</h3>
                    <Badge className="bg-primary/10 text-primary">
                      {Math.round(scanResult.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-lg italic">{scanResult.species_detected}</p>
                </div>

                {/* Health Assessment */}
                <div className="space-y-2">
                  <h3>Health Assessment</h3>
                  <div className="flex items-center gap-2">
                    {scanResult.health_assessment === 'healthy' ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                    <Badge
                      className={`capitalize ${
                        scanResult.health_assessment === 'healthy'
                          ? 'bg-primary/10 text-primary'
                          : scanResult.health_assessment === 'stressed'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-chart-3/10 text-chart-3'
                      }`}
                    >
                      {scanResult.health_assessment}
                    </Badge>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <h3>Recommendations</h3>
                  <ul className="space-y-2">
                    {scanResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Save to Batch */}
                <div className="pt-4 border-t">
                  <Button className="w-full">
                    Save to Batch Record
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>View your scanning history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { species: 'Pterocarpus indicus', confidence: 0.95, health: 'healthy', time: '1 hour ago' },
              { species: 'Dipterocarpus grandiflorus', confidence: 0.88, health: 'healthy', time: '3 hours ago' },
              { species: 'Shorea contorta', confidence: 0.91, health: 'stressed', time: '5 hours ago' },
            ].map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="italic">{scan.species}</p>
                  <p className="text-sm text-muted-foreground">{scan.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{Math.round(scan.confidence * 100)}%</Badge>
                  <Badge className={scan.health === 'healthy' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}>
                    {scan.health}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
