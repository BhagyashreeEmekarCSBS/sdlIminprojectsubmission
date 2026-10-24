import QRCode from 'qrcode';

/**
 * Generate a high quality QR Code Data URL (Base64 PNG)
 * @param text The payload to encode (e.g. SCP-VERIFY:ORD-xxx:SC-xxx:PAID)
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 280,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

/**
 * Creates the standardized verification payload string for token verification
 */
export function buildQrPayload(orderNumber: string, tokenNumber: string, paymentStatus: string): string {
  return `SCP-VERIFY:${orderNumber}:${tokenNumber}:${paymentStatus}`;
}
