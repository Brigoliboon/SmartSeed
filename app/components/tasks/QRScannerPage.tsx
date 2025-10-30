"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { QrCode, Scan } from 'lucide-react';
import { TaskChecklist } from './TaskChecklist';

interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

interface QRScannerPageProps {
  user: User;
}

export function QRScannerPage({ user }: QRScannerPageProps) {
  const [qrCode, setQrCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedBedId, setScannedBedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setError('Please enter a QR code');
      return;
    }

    setScanning(true);
    setError('');

    try {
      // Verify the QR code exists
      const response = await fetch(`/api/tasks/bed/${qrCode}`);
      const data = await response.json();

      if (data.success) {
        setScannedBedId(qrCode);
      } else {
        setError('Invalid QR code or bed not found');
      }
    } catch (err) {
      setError('Error scanning QR code');
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setScannedBedId(null);
    setQrCode('');
    setError('');
  };

  if (scannedBedId) {
    return (
      <TaskChecklist
        bedId={scannedBedId}
        user={user}
        onBack={handleReset}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Scan Plant Bed QR Code</h1>
        <p className="text-muted-foreground text-lg">
          Enter the bed QR code to view and complete daily tasks
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-6 h-6" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Input */}
          <div className="space-y-3">
            <label className="text-lg font-medium">Enter QR Code</label>
            <div className="flex gap-3">
              <Input
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                placeholder="e.g., BED-A1-QR2024"
                className="text-lg h-14"
                disabled={scanning}
              />
              <Button
                onClick={handleScan}
                disabled={scanning || !qrCode.trim()}
                size="lg"
                className="h-14 px-8"
              >
                <Scan className="w-5 h-5 mr-2" />
                {scanning ? 'Scanning...' : 'Scan'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-muted/50 p-6 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Each plant bed has a unique QR code</li>
              <li>Enter the QR code shown on the bed label</li>
              <li>You'll see a checklist of daily tasks for that bed</li>
              <li>Complete each task and check the boxes</li>
              <li>Once all tasks are done, the bed is marked as "Task Completed"</li>
            </ol>
          </div>

          {/* Quick Access Codes */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Quick access (for testing):</p>
            <div className="grid grid-cols-2 gap-2">
              {['BED-A1-QR2024', 'BED-A2-QR2024', 'BED-B1-QR2024', 'BED-C1-QR2024'].map((code) => (
                <Button
                  key={code}
                  variant="outline"
                  onClick={() => {
                    setQrCode(code);
                    setError('');
                  }}
                  className="text-xs"
                >
                  {code}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Logged in as</p>
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-sm text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
