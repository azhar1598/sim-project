"use client";

import { useState, useRef } from "react";
import jsQR from "jsqr";
import { parseQRCodeData } from "../utils/calculations";
import Button from "./ui/Button";

interface QRUIDScannerProps {
  onUIDScanned: (uid: string) => void;
  onError?: (error: string) => void;
  label?: string;
  placeholder?: string;
}

export default function QRUIDScanner({
  onUIDScanned,
  onError,
  label = "Scan QR Code",
  placeholder = "UID will appear here after scanning",
}: QRUIDScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [scannedUID, setScannedUID] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
        scanFromVideo();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      onError?.("Camera access denied. Please allow camera permissions.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const scanFromVideo = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const scan = () => {
      if (!isScanning) return;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      try {
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          console.log("🎯 QR Code detected:", code.data);
          handleQRData(code.data);
          return;
        }
      } catch (error) {
        console.error("Error scanning QR code:", error);
      }

      requestAnimationFrame(scan);
    };

    scan();
  };

  const handleQRData = (qrData: string) => {
    console.log("📱 Processing QR data:", qrData);

    const parsedData = parseQRCodeData(qrData);
    console.log("🔍 Parsed data:", parsedData);

    if (parsedData && parsedData.type === "uid" && parsedData.id) {
      const uid = parsedData.id;
      console.log("✅ UID extracted:", uid);

      setScannedUID(uid);
      onUIDScanned(uid);
      stopCamera();

      alert(`✅ Successfully scanned UID: ${uid}`);
    } else {
      // Try direct URL parsing as fallback
      try {
        const url = new URL(qrData);
        const uid = url.searchParams.get("UID");

        if (uid) {
          console.log("✅ UID extracted from URL:", uid);
          setScannedUID(uid);
          onUIDScanned(uid);
          stopCamera();
          alert(`✅ Successfully scanned UID: ${uid}`);
          return;
        }
      } catch (e) {
        // Not a URL, check if it's just a plain UID
        if (qrData.length > 5 && qrData.length < 50) {
          console.log("✅ Using QR data as UID:", qrData);
          setScannedUID(qrData);
          onUIDScanned(qrData);
          stopCamera();
          alert(`✅ Successfully scanned UID: ${qrData}`);
          return;
        }
      }

      onError?.(
        "QR code does not contain a valid UID. Expected format: https://app.stockfactory.com?UID=YOUR_ID"
      );
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            handleQRData(code.data);
          } else {
            onError?.("No QR code found in the image.");
          }
        } catch (error) {
          console.error("Error scanning uploaded image:", error);
          onError?.("Error processing the image. Please try again.");
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;

    handleQRData(manualInput.trim());
    setManualInput("");
  };

  const handleTestUID = () => {
    const testUID = "JK68DEFE234HJE";
    setScannedUID(testUID);
    onUIDScanned(testUID);
    alert(`✅ Test UID applied: ${testUID}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>

        {/* Display scanned UID */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-300 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Scanned UID:</p>
          <p className="font-mono text-lg font-medium text-gray-900">
            {scannedUID || placeholder}
          </p>
        </div>

        {/* Scanning Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Camera Scan */}
          <Button
            onClick={isScanning ? stopCamera : startCamera}
            variant={isScanning ? "danger" : "primary"}
            className="w-full"
          >
            {isScanning ? "Stop Camera" : "📷 Use Camera"}
          </Button>

          {/* Image Upload */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            className="w-full"
          >
            🖼️ Upload Image
          </Button>

          {/* Test UID */}
          <Button onClick={handleTestUID} variant="warning" className="w-full">
            🧪 Test UID
          </Button>
        </div>

        {/* Manual Input */}
        <div className="mt-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or paste QR code data manually..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button onClick={handleManualSubmit} variant="secondary">
              Process
            </Button>
          </div>
        </div>
      </div>

      {/* Camera Video */}
      {isScanning && (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full max-w-md mx-auto rounded-lg border"
            autoPlay
            playsInline
            muted
          />
          <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-red-500 rounded-lg"></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Position QR code within the red square
          </p>
        </div>
      )}

      {/* Hidden elements */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
