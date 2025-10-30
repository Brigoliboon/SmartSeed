"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Camera, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { TaskChecklist } from './TaskChecklist';

interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

interface CameraQRScannerProps {
  user: User;
}

export function CameraQRScanner({ user }: CameraQRScannerProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedBedId, setScannedBedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState('');

  // Sample QR codes for quick testing
  const sampleCodes = [
    'BED-A1-QR2024',
    'BED-A2-QR2024',
    'BED-B1-QR2024',
    'BED-C1-QR2024'
  ];

  useEffect(() => {
    let html5QrCode: any = null;

    const startScanner = async () => {
      if (isCameraActive) {
        try {
          // Dynamically import html5-qrcode
          const { Html5Qrcode } = await import('html5-qrcode');
          html5QrCode = new Html5Qrcode('qr-reader');
          
          setScanStatus('Starting camera...');
          
          await html5QrCode.start(
            { facingMode: 'environment' }, // Use back camera
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            async (decodedText: string) => {
              // QR code successfully scanned
              console.log('QR Code detected:', decodedText);
              setScanStatus(`Detected: ${decodedText}`);
              
              // Stop scanning and validate
              if (html5QrCode) {
                await html5QrCode.stop();
              }
              
              // Validate the QR code
              await validateAndLoadBed(decodedText);
            },
            (errorMessage: string) => {
              // This fires constantly while scanning - ignore
            }
          );
          
          setScanStatus('Point camera at QR code...');
        } catch (err: any) {
          console.error('Scanner error:', err);
          
          // Better error messages based on error type
          let errorMsg = 'Unable to access camera. ';
          
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMsg += 'Please allow camera permission in your browser settings and try again.';
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMsg += 'No camera found on this device.';
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            errorMsg += 'Camera is being used by another app. Please close other camera apps and try again.';
          } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
            errorMsg += 'Camera does not support required settings. Try using manual entry.';
          } else {
            errorMsg += err.message || 'Please try manual entry instead.';
          }
          
          setError(errorMsg);
          setIsCameraActive(false);
          setScanStatus('');
        }
      }
    };

    startScanner();

    return () => {
      // Cleanup: stop camera when component unmounts or camera is turned off
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((err: any) => console.error('Stop error:', err));
      }
    };
  }, [isCameraActive]);

  const validateAndLoadBed = async (code: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/tasks/bed/${code.trim()}`);
      const data = await response.json();

      if (data.success) {
        setScannedBedId(code.trim());
        setManualCode('');
        setIsCameraActive(false);
        setScanStatus('');
      } else {
        setError('Invalid QR code. Please try again.');
        setScanStatus('');
        // Restart camera after 2 seconds
        setTimeout(() => {
          setIsCameraActive(true);
        }, 2000);
      }
    } catch (err) {
      setError('Error validating QR code');
      console.error(err);
      setScanStatus('');
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setError('');
    setScanStatus('Initializing camera...');
    setIsCameraActive(true);
  };

  const stopCamera = () => {
    setIsCameraActive(false);
    setScanStatus('');
  };

  const handleManualScan = async () => {
    if (!manualCode.trim()) {
      setError('Please enter a QR code');
      return;
    }

    await validateAndLoadBed(manualCode);
  };

  const handleQuickAccess = async (code: string) => {
    setManualCode(code);
    await validateAndLoadBed(code);
  };

  const handleBack = () => {
    setScannedBedId(null);
    setManualCode('');
    setError('');
    setScanStatus('');
  };

  if (scannedBedId) {
    return <TaskChecklist bedId={scannedBedId} user={user} onBack={handleBack} />;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Scan QR Code</h1>
        <p className="text-muted-foreground">
          Scan the bed's QR code to view and complete daily tasks
        </p>
      </div>

      {/* Camera Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Camera Scanner
            </span>
            {isCameraActive && (
              <Button variant="destructive" size="sm" onClick={stopCamera}>
                <X className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCameraActive ? (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center space-y-3">
                  <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Camera is not active
                  </p>
                </div>
              </div>
              <Button onClick={startCamera} className="w-full" size="lg">
                <Camera className="w-5 h-5 mr-2" />
                Start Camera Scanner
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* QR Scanner Container */}
              <div 
                id="qr-reader" 
                className="rounded-lg overflow-hidden"
                style={{ 
                  width: '100%',
                  border: '2px solid #e5e7eb'
                }}
              />
              
              {scanStatus && !error && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-sm text-blue-900">{scanStatus}</p>
                  </div>
                </div>
              )}
              
              {loading && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <p className="text-sm text-yellow-900">Validating QR code...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium">Camera Access Required</p>
                  <p className="text-sm">{error}</p>
                  <div className="text-sm space-y-1 pt-2 border-t border-destructive/20">
                    <p className="font-medium">How to enable camera:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Tap the lock icon or settings icon in your browser's address bar</li>
                      <li>Find "Camera" or "Permissions"</li>
                      <li>Change to "Allow"</li>
                      <li>Refresh the page and try again</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Camera Permission Help */}
      {!isCameraActive && !scannedBedId && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900">Camera Scanner Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Browser will ask for camera permission - tap "Allow"</li>
                  <li>• Point camera steadily at the QR code</li>
                  <li>• Make sure the QR code is well-lit</li>
                  <li>• If camera doesn't work, use manual entry below</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter QR code (e.g., BED-A1-QR2024)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
              disabled={loading}
              className="text-lg"
            />
            <Button onClick={handleManualScan} disabled={loading} size="lg">
              {loading ? 'Checking...' : 'Scan'}
            </Button>
          </div>

          {/* Quick Access Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Quick Access (Testing):</p>
            <div className="grid grid-cols-2 gap-2">
              {sampleCodes.map((code) => (
                <Button
                  key={code}
                  variant="outline"
                  onClick={() => handleQuickAccess(code)}
                  disabled={loading}
                  className="h-auto py-3"
                >
                  <div className="text-left w-full">
                    <div className="font-mono text-xs">{code}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Logged in as</p>
              <p className="font-semibold">{user.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-semibold capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
