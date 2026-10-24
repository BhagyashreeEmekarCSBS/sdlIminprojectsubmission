'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  QrCode,
  ShieldCheck,
  User,
  Clock,
  Utensils,
  X,
} from 'lucide-react';

export default function StaffScanner({ onOrderVerified }: { onOrderVerified?: () => void }) {
  const [manualToken, setManualToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    order?: any;
    verifiedBy?: string;
  } | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(scanQrFrame);
      }
    } catch (err: any) {
      console.warn('Camera access not available or denied:', err);
      setCameraError('Camera access not available or permission denied. Please use manual token entry below.');
      setIsCameraActive(false);
    }
  };

  const scanQrFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            // Found QR Code!
            stopCamera();
            verifyTokenPayload(undefined, code.data);
            return;
          }
        }
      }
    }
    if (isCameraActive) {
      animationFrameId.current = requestAnimationFrame(scanQrFrame);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const verifyTokenPayload = async (token?: string, qrPayload?: string) => {
    const tokenToVerify = token || manualToken;
    if (!tokenToVerify && !qrPayload) {
      setVerificationResult({
        success: false,
        message: 'Please enter a token number or scan a QR code.',
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch('/api/orders/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenNumber: tokenToVerify ? tokenToVerify.trim().toUpperCase() : undefined,
          qrPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setVerificationResult({
          success: false,
          message: data.error || 'Verification failed.',
          order: data.order,
        });
      } else {
        setVerificationResult({
          success: true,
          message: data.message,
          order: data.order,
          verifiedBy: data.verifiedBy,
        });
        setManualToken('');
        if (onOrderVerified) onOrderVerified();
      }
    } catch (err: any) {
      setVerificationResult({
        success: false,
        message: 'Network error during verification.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyTokenPayload();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-600/10 text-orange-600 flex items-center justify-center font-bold">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Counter Pickup Verification
            </h3>
            <p className="text-[11px] text-slate-500">
              Verify student QR code or enter pickup token
            </p>
          </div>
        </div>

        {isCameraActive ? (
          <button
            onClick={stopCamera}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
          >
            <X className="w-3.5 h-3.5" />
            <span>Stop Camera</span>
          </button>
        ) : (
          <button
            onClick={startCamera}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
        )}
      </div>

      {/* Camera Preview Section */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-orange-500">
          <video ref={videoRef} className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 border-2 border-dashed border-white/60 m-8 rounded-2xl pointer-events-none flex items-center justify-center">
            <span className="bg-black/60 backdrop-blur-xs text-white text-xs font-medium px-3 py-1 rounded-full">
              Align QR code inside box
            </span>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Manual Token Input Form */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input
          type="text"
          value={manualToken}
          onChange={(e) => setManualToken(e.target.value.toUpperCase())}
          placeholder="ENTER TOKEN (e.g. SC-1008)"
          className="flex-1 text-sm uppercase font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          disabled={isVerifying}
          className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isVerifying ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            'Verify & Hand Over'
          )}
        </button>
      </form>

      {/* Verification Feedback Result Display */}
      {verificationResult && (
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in slide-in-from-top-2 ${
            verificationResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {verificationResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="font-extrabold text-sm">
                {verificationResult.success ? 'TOKEN VERIFIED FOR PICKUP' : 'VERIFICATION REJECTED'}
              </h4>
              <p className="mt-0.5 text-xs opacity-90 leading-relaxed font-medium">
                {verificationResult.message}
              </p>
            </div>
          </div>

          {/* If order details available, show handover checklist */}
          {verificationResult.order && (
            <div className="pt-2 border-t border-current/20 space-y-1.5 font-sans">
              <div className="flex justify-between font-bold">
                <span>Student:</span>
                <span>
                  {verificationResult.order.user?.name || 'Student'} (
                  {verificationResult.order.user?.studentId || 'ID Verified'})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Order No:</span>
                <span className="font-mono">{verificationResult.order.orderNumber}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Amount:</span>
                <span>₹{verificationResult.order.totalAmount?.toFixed(2)} (PAID)</span>
              </div>

              {/* Food items checklist */}
              <div className="mt-2 pt-2 border-t border-current/10">
                <span className="font-bold block mb-1">Items to hand over to student:</span>
                <ul className="space-y-1">
                  {verificationResult.order.items?.map((item: any) => (
                    <li key={item.id} className="flex items-center gap-1.5 font-medium">
                      <span className="font-bold">✓</span>
                      <span>
                        {item.itemName} x {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
