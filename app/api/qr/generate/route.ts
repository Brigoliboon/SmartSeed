import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

// POST /api/qr/generate - Generate QR code image for a bed
export async function POST(request: NextRequest) {
  try {
    const { qrCode, bedName } = await request.json();

    if (!qrCode) {
      return NextResponse.json(
        { success: false, error: 'QR code is required' },
        { status: 400 }
      );
    }

    // Get the base URL (works in development and production)
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Create the URL that the QR code will point to (using query parameter)
    const targetUrl = `${baseUrl}/task?qr=${qrCode}`;

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      qrCodeImage: qrDataUrl,
      targetUrl: targetUrl,
      qrCode: qrCode
    });

  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
