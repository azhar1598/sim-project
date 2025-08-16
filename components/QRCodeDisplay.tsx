"use client";

import { useEffect, useRef } from "react";
import { Block, Slab } from "../types";

interface QRCodeDisplayProps {
  block?: Block;
  slab?: Slab;
  onClose: () => void;
}

export default function QRCodeDisplay({
  block,
  slab,
  onClose,
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      generateQRCode();
    }
  }, [block, slab]);

  const generateQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Simple QR code placeholder - in a real app, you'd use a QR library
    const qrData = block ? block.qrCode : slab?.qrCode || "";

    // Set canvas size
    canvas.width = 200;
    canvas.height = 200;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 200, 200);

    // Draw a simple pattern to represent QR code
    ctx.fillStyle = "#000000";

    // Create a simple grid pattern
    const gridSize = 10;
    const cellSize = 200 / gridSize;

    // Generate pseudo-random pattern based on data
    const seed = qrData
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Simple pseudo-random pattern
        if ((seed + i * j + i + j) % 3 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    // Add corner markers (typical QR code feature)
    const markerSize = cellSize * 3;

    // Top-left marker
    ctx.fillRect(0, 0, markerSize, markerSize);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cellSize, cellSize, cellSize, cellSize);

    // Top-right marker
    ctx.fillStyle = "#000000";
    ctx.fillRect(200 - markerSize, 0, markerSize, markerSize);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(200 - markerSize + cellSize, cellSize, cellSize, cellSize);

    // Bottom-left marker
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 200 - markerSize, markerSize, markerSize);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cellSize, 200 - markerSize + cellSize, cellSize, cellSize);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    const item = block || slab;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${block ? "Block" : "Slab"} #${item?.id.slice(
      -6
    )}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
              margin: 0;
            }
            .qr-container {
              border: 2px solid #000;
              padding: 20px;
              display: inline-block;
              margin: 20px;
            }
            .qr-code {
              margin: 10px 0;
            }
            .info {
              margin-top: 15px;
              font-size: 12px;
              text-align: left;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>${block ? "Stone Block" : "Stone Slab"} #${item?.id.slice(
      -6
    )}</h2>
            <div class="qr-code">
              <img src="${dataUrl}" alt="QR Code" />
            </div>
            <div class="info">
              ${
                block
                  ? `
                <p><strong>Dimensions:</strong> ${block.dimensions.length} × ${
                      block.dimensions.width
                    } × ${block.dimensions.height} cm</p>
                <p><strong>Thickness:</strong> ${block.thickness} cm</p>
                <p><strong>Estimated Slabs:</strong> ${block.estimatedSlabs}</p>
                <p><strong>Created:</strong> ${new Date(
                  block.createdAt
                ).toLocaleDateString()}</p>
                <p><strong>Created By:</strong> ${block.createdBy}</p>
              `
                  : `
                <p><strong>Block ID:</strong> ${slab?.blockId.slice(-6)}</p>
                <p><strong>Status:</strong> ${slab?.status}</p>
                <p><strong>Quality:</strong> ${slab?.quality}</p>
              `
              }
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `qr-code-${block ? "block" : "slab"}-${(
      block || slab
    )?.id.slice(-6)}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const item = block || slab;
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {block ? "Block" : "Slab"} QR Code Generated
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-gray-50 rounded-lg">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-300"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            </div>

            <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                {block ? "Block" : "Slab"} Details
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>ID:</strong> #{item.id.slice(-6)}
                </p>
                {block && (
                  <>
                    <p>
                      <strong>Dimensions:</strong> {block.dimensions.length} ×{" "}
                      {block.dimensions.width} × {block.dimensions.height} cm
                    </p>
                    <p>
                      <strong>Thickness:</strong> {block.thickness} cm
                    </p>
                    <p>
                      <strong>Estimated Slabs:</strong> {block.estimatedSlabs}
                    </p>
                    <p>
                      <strong>Created By:</strong> {block.createdBy}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(block.createdAt).toLocaleDateString()}
                    </p>
                  </>
                )}
                {slab && (
                  <>
                    <p>
                      <strong>Block ID:</strong> #{slab.blockId.slice(-6)}
                    </p>
                    <p>
                      <strong>Status:</strong> {slab.status}
                    </p>
                    <p>
                      <strong>Quality:</strong> {slab.quality}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                🖨️ Print QR Code
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              >
                💾 Download
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                📱 <strong>Next Steps:</strong> Print this QR code and attach it
                to your {block ? "stone block" : "slab"}. Use the QR scanner in
                the app to track and inspect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
