"use client";

import { useRef } from "react";
import jsQR from "jsqr";

interface QRImageUploadProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export default function QRImageUpload({ onScan, onError }: QRImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      onError?.("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        scanImageForQR(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const scanImageForQR = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image to canvas
    ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    try {
      // Scan for QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });

      if (code) {
        console.log("🎯 QR Code found in uploaded image:", code.data);
        onScan(code.data);

        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        onError?.(
          "No QR code found in the uploaded image. Please try a clearer image."
        );
      }
    } catch (error) {
      console.error("Error scanning uploaded image:", error);
      onError?.("Error processing the image. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 text-sm"
      >
        Choose QR Image
      </button>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="text-xs text-gray-500">
        <p>Perfect for the QR image you shared! 📱</p>
      </div>
    </div>
  );
}
