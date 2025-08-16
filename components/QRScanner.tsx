"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  isActive: boolean;
}

export default function QRScanner({
  onScan,
  onError,
  isActive,
}: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      // Check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoDevices.length === 0) {
        setHasCamera(false);
        onError?.("No camera found on this device");
        return;
      }

      setHasCamera(true);

      // Get camera stream - prefer back camera on mobile
      const constraints = {
        video: {
          facingMode: { ideal: "environment" }, // Back camera
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setIsScanning(true);
        startScanning();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasCamera(false);
      onError?.("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    setIsScanning(false);
  };

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    scanIntervalRef.current = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const qrCode = scanQRFromImageData(imageData);

        if (qrCode) {
          onScan(qrCode);
          // Brief pause after successful scan
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            setTimeout(() => {
              if (isActive) startScanning();
            }, 2000);
          }
        }
      }
    }, 500); // Scan every 500ms
  };

  // Real QR code detection using jsQR library
  const scanQRFromImageData = (imageData: ImageData): string | null => {
    try {
      // Use jsQR to detect and decode QR codes
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        console.log("🎯 QR Code detected:", code.data);
        return code.data;
      }

      return null;
    } catch (error) {
      console.error("Error scanning QR code:", error);
      return null;
    }
  };

  if (!hasCamera && isActive) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Camera Not Available
        </h3>
        <p className="text-gray-600 mb-4">
          Camera access is required for QR code scanning. Please ensure:
        </p>
        <ul className="text-left text-sm text-gray-600 space-y-1 max-w-md mx-auto">
          <li>• Your device has a camera</li>
          <li>• Camera permissions are granted</li>
          <li>• You're using HTTPS (required for camera access)</li>
          <li>• No other app is using the camera</li>
        </ul>
        <button
          onClick={startCamera}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="relative bg-black rounded-lg overflow-hidden"
        style={{ aspectRatio: "4/3" }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="border-2 border-blue-500 bg-blue-500/10 rounded-lg"
              style={{ width: "60%", height: "60%" }}
            >
              <div className="w-full h-full relative">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>

                {/* Scanning line animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="w-full h-0.5 bg-blue-500 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status indicator */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {isScanning ? "📷 Scanning..." : "📷 Initializing..."}
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Position the QR code within the blue frame to scan
        </p>
        <div className="mt-2 flex justify-center space-x-4">
          <button
            onClick={stopCamera}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Stop Camera
          </button>
          <button
            onClick={() => {
              stopCamera();
              setTimeout(startCamera, 100);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Restart Camera
          </button>
        </div>
      </div>
    </div>
  );
}
