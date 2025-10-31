"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { QrCode, Download, Eye, Printer, RefreshCw } from 'lucide-react';

interface Bed {
  bed_id: number;
  bed_name: string;
  location_name: string;
  species_category: string;
  qr_code: string;
  person_in_charge: string;
}

export function QRManagementPage() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [qrImage, setQrImage] = useState<string>('/qrcode.png');
  const [targetUrl, setTargetUrl] = useState<string>('');

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/beds');
      const data = await response.json();
      if (data.success) {
        setBeds(data.beds);
      }
    } catch (error) {
      console.error('Error fetching beds:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (bed: Bed) => {
    setGeneratingQR(bed.qr_code);
    setSelectedBed(bed);

    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode: bed.qr_code,
          bedName: bed.bed_name
        })
      });

      const data = await response.json();

      if (data.success) {
        setQrImage('/qrcode.png'); // Temporarily set to placeholder
        setTargetUrl(data.targetUrl);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setGeneratingQR(null);
    }
  };

  const downloadQRCode = () => {
    if (!qrImage || !selectedBed) return;

    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `${selectedBed.bed_name}-QR-Code.png`;
    link.click();
  };

  const printQRCode = () => {
    if (!qrImage) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${selectedBed?.bed_name}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .container {
                text-align: center;
                padding: 40px;
              }
              h1 {
                margin-bottom: 10px;
                font-size: 32px;
              }
              .subtitle {
                color: #666;
                margin-bottom: 30px;
                font-size: 18px;
              }
              img {
                border: 2px solid #000;
                padding: 20px;
                background: white;
              }
              .qr-code {
                font-family: monospace;
                font-size: 20px;
                margin-top: 20px;
                font-weight: bold;
              }
              @media print {
                body {
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${selectedBed?.bed_name}</h1>
              <p class="subtitle">${selectedBed?.location_name} - ${selectedBed?.species_category}</p>
              <img src="/qrcode.png" alt="QR Code" />
              <p class="qr-code">${selectedBed?.qr_code}</p>
              <p style="margin-top: 30px; color: #666;">Scan to view and complete daily tasks</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Forestry': 'bg-green-100 text-green-800 border-green-200',
      'Fruit Tree': 'bg-orange-100 text-orange-800 border-orange-200',
      'Ornamental': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading beds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">QR Code Management</h1>
        <p className="text-muted-foreground">
          Generate and manage QR codes for plant beds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Beds List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plant Beds ({beds.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {beds.map((bed) => (
                <Card key={bed.bed_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{bed.bed_name}</h3>
                        <p className="text-sm text-muted-foreground">{bed.location_name}</p>
                      </div>
                      <Badge className={getCategoryColor(bed.species_category)}>
                        {bed.species_category}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">In charge:</span>
                        <span className="font-medium">{bed.person_in_charge}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">QR Code:</span>
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {bed.qr_code}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => generateQRCode(bed)}
                      disabled={generatingQR === bed.qr_code}
                      className="w-full"
                      variant={selectedBed?.bed_id === bed.bed_id ? "default" : "outline"}
                    >
                      {generatingQR === bed.qr_code ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4 mr-2" />
                          {selectedBed?.bed_id === bed.bed_id ? 'Generated' : 'Generate QR Code'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* QR Code Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          {!selectedBed ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-3">
                  <QrCode className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No QR Code Generated</h3>
                    <p className="text-muted-foreground text-sm">
                      Click "Generate QR Code" on any bed to create and preview the QR code
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bed Info */}
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h3 className="font-semibold text-lg">{selectedBed.bed_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedBed.location_name}</p>
                  <Badge className={getCategoryColor(selectedBed.species_category)}>
                    {selectedBed.species_category}
                  </Badge>
                </div>

                {/* QR Code Image */}
                {qrImage && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-6 bg-white flex items-center justify-center">
                      <img 
                        src={qrImage} 
                        alt={`QR Code for ${selectedBed.bed_name}`}
                        className="max-w-full h-auto"
                      />
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-1">Target URL:</p>
                      <p className="text-xs text-blue-700 break-all font-mono">{targetUrl}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={downloadQRCode} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={printQRCode} variant="outline">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        How to use
                      </h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• Download or print this QR code</li>
                        <li>• Attach it to the physical plant bed</li>
                        <li>• Field workers scan it to access tasks</li>
                        <li>• No login required for scanning</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
