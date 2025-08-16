"use client";

import { useState, useEffect } from "react";
import { Block, Slab } from "../types";
import { loadBlocks, loadSlabs, saveSlab, saveBlock } from "../utils/storage";
import {
  generateId,
  parseQRCodeData,
  generateQRCodeData,
  calculateYieldPercentage,
} from "../utils/calculations";
import QRCodeDisplay from "./QRCodeDisplay";
import QRScanner from "./QRScanner";
import TestQRGenerator from "./TestQRGenerator";
import QRImageUpload from "./QRImageUpload";
import QRUIDScanner from "./QRUIDScanner";

export default function SlabInspection() {
  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
  const [qrInput, setQrInput] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [currentSlab, setCurrentSlab] = useState<Slab | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const [inspectionForm, setInspectionForm] = useState({
    length: "",
    width: "",
    thickness: "",
    quality: "good" as "excellent" | "good" | "fair" | "defective",
    defects: [] as string[],
    notes: "",
    inspectedBy: "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    setBlocks(loadBlocks());
    setSlabs(loadSlabs());
  }, []);

  const defectOptions = [
    "Cracks",
    "Chips",
    "Discoloration",
    "Rough surface",
    "Size deviation",
    "Thickness variation",
    "Other defects",
  ];

  const handleQRScan = (qrData: string) => {
    try {
      console.log("🔍 QR Data received:", qrData);
      const parsedData = parseQRCodeData(qrData);
      console.log("📊 Parsed QR Data:", parsedData);

      if (!parsedData || !parsedData.type || !parsedData.id) {
        console.log("❌ Invalid QR format");
        setErrors(["Invalid QR code format"]);
        return;
      }

      if (parsedData.type === "block") {
        console.log("🧱 Looking for block:", parsedData.id);
        console.log(
          "📦 Available blocks:",
          blocks.map((b) => b.id)
        );

        const block = blocks.find((b) => b.id === parsedData.id);
        if (!block) {
          console.log("❌ Block not found");
          setErrors([
            `Block #${parsedData.id} not found in system. Available blocks: ${
              blocks.map((b) => "#" + b.id.slice(-6)).join(", ") || "none"
            }`,
          ]);
          return;
        }

        console.log("✅ Block found, switching to manual mode");
        setSelectedBlock(block);
        setActiveTab("manual");
        setShowCamera(false);
        setErrors([]);
        alert(`✅ Successfully scanned Block #${block.id.slice(-6)}!`);
      } else if (parsedData.type === "slab") {
        console.log("🔲 Looking for slab:", parsedData.id);
        const slab = slabs.find((s) => s.id === parsedData.id);
        if (!slab) {
          setErrors(["Slab not found in system"]);
          return;
        }
        // Load existing slab for editing
        setCurrentSlab(slab);
        const parentBlock = blocks.find((b) => b.id === slab.blockId);
        setSelectedBlock(parentBlock || null);

        // Pre-fill form with existing data
        if (slab.actualDimensions) {
          setInspectionForm({
            length: slab.actualDimensions.length.toString(),
            width: slab.actualDimensions.width.toString(),
            thickness: slab.actualDimensions.thickness.toString(),
            quality: slab.quality,
            defects: slab.defects,
            notes: slab.notes || "",
            inspectedBy: slab.inspectedBy || "",
          });
        }
        setActiveTab("manual");
        setShowCamera(false);
        setErrors([]);
        alert(`✅ Successfully scanned Slab #${slab.id.slice(-6)}!`);
      } else {
        console.log("❌ Unknown QR type:", parsedData.type);
        setErrors(["Unknown QR code type"]);
      }
    } catch (error) {
      console.error("❌ QR scan error:", error);
      setErrors(["Error parsing QR code: " + error]);
    }
  };

  const handleManualQRScan = () => {
    handleQRScan(qrInput);
  };

  const handleDefectToggle = (defect: string) => {
    setInspectionForm((prev) => ({
      ...prev,
      defects: prev.defects.includes(defect)
        ? prev.defects.filter((d) => d !== defect)
        : [...prev.defects, defect],
    }));
  };

  const handleCreateSlab = () => {
    if (!selectedBlock) return;

    const slabId = generateId();
    const qrCodeData = generateQRCodeData("slab", slabId, {
      blockId: selectedBlock.id,
      estimatedDimensions: {
        length: selectedBlock.dimensions.length,
        width: selectedBlock.dimensions.width,
        thickness: selectedBlock.thickness,
      },
    });

    const newSlab: Slab = {
      id: slabId,
      blockId: selectedBlock.id,
      qrCode: qrCodeData,
      estimatedDimensions: {
        length: selectedBlock.dimensions.length,
        width: selectedBlock.dimensions.width,
        thickness: selectedBlock.thickness,
      },
      quality: "good",
      defects: [],
      status: "pending",
      discrepancies: [],
    };

    saveSlab(newSlab);
    setCurrentSlab(newSlab);
    setSlabs((prev) => [...prev, newSlab]);
    setShowQRCode(true);
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      if (!selectedBlock || !currentSlab) {
        setErrors(["No slab selected for inspection"]);
        return;
      }

      const length = parseFloat(inspectionForm.length);
      const width = parseFloat(inspectionForm.width);
      const thickness = parseFloat(inspectionForm.thickness);

      if (length <= 0 || width <= 0 || thickness <= 0) {
        setErrors(["All dimensions must be greater than 0"]);
        return;
      }

      if (!inspectionForm.inspectedBy.trim()) {
        setErrors(["Inspector name is required"]);
        return;
      }

      // Calculate discrepancies
      const discrepancies: string[] = [];
      const estimatedDims = currentSlab.estimatedDimensions;

      const lengthDiff = Math.abs(length - estimatedDims.length);
      const widthDiff = Math.abs(width - estimatedDims.width);
      const thicknessDiff = Math.abs(thickness - estimatedDims.thickness);

      if (lengthDiff > estimatedDims.length * 0.05) {
        // 5% tolerance
        discrepancies.push(`Length difference: ${lengthDiff.toFixed(1)}cm`);
      }
      if (widthDiff > estimatedDims.width * 0.05) {
        discrepancies.push(`Width difference: ${widthDiff.toFixed(1)}cm`);
      }
      if (thicknessDiff > estimatedDims.thickness * 0.1) {
        // 10% tolerance for thickness
        discrepancies.push(
          `Thickness difference: ${thicknessDiff.toFixed(1)}cm`
        );
      }

      // Update slab
      const updatedSlab: Slab = {
        ...currentSlab,
        actualDimensions: { length, width, thickness },
        quality: inspectionForm.quality,
        defects: inspectionForm.defects,
        discrepancies,
        notes: inspectionForm.notes.trim() || undefined,
        inspectedAt: new Date().toISOString(),
        inspectedBy: inspectionForm.inspectedBy.trim(),
        status:
          inspectionForm.quality === "defective" ? "rejected" : "approved",
      };

      saveSlab(updatedSlab);
      setSlabs((prev) =>
        prev.map((s) => (s.id === updatedSlab.id ? updatedSlab : s))
      );

      // Update block's actual slab count
      const blockSlabs = slabs.filter(
        (s) => s.blockId === selectedBlock.id && s.status !== "pending"
      );
      const updatedBlock: Block = {
        ...selectedBlock,
        actualSlabs: blockSlabs.length + 1,
        yield: calculateYieldPercentage(
          selectedBlock.estimatedSlabs,
          blockSlabs.length + 1
        ),
      };

      saveBlock(updatedBlock);
      setBlocks((prev) =>
        prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b))
      );

      // Reset form
      setInspectionForm({
        length: "",
        width: "",
        thickness: "",
        quality: "good",
        defects: [],
        notes: "",
        inspectedBy: inspectionForm.inspectedBy, // Keep inspector name
      });

      setCurrentSlab(null);
      setSelectedBlock(null);
      alert("Slab inspection completed successfully!");
    } catch (error) {
      setErrors(["An error occurred while saving the inspection"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const blockSlabs = selectedBlock
    ? slabs.filter((s) => s.blockId === selectedBlock.id)
    : [];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Slab Inspection</h1>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("scan")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === "scan"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📱 Scan QR Code
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === "manual"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📝 Manual Selection
          </button>
        </nav>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <ul className="text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* QR Scanner Tab */}
          {activeTab === "scan" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Scan QR Code
              </h2>

              {!showCamera ? (
                <div className="space-y-4">
                  {/* Modern UID Scanner */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-4">
                      🎯 Scan Block/Slab QR Code
                    </h3>
                    <QRUIDScanner
                      onUIDScanned={(uid) => {
                        // Try to find block first
                        const block = blocks.find((b) => b.id === uid);
                        if (block) {
                          setSelectedBlock(block);
                          setActiveTab("manual");
                          setShowCamera(false);
                          setErrors([]);
                          alert(`✅ Successfully found Block: ${uid}`);
                          return;
                        }

                        // Try to find slab
                        const slab = slabs.find((s) => s.id === uid);
                        if (slab) {
                          setCurrentSlab(slab);
                          const parentBlock = blocks.find(
                            (b) => b.id === slab.blockId
                          );
                          setSelectedBlock(parentBlock || null);
                          setActiveTab("manual");
                          setShowCamera(false);
                          setErrors([]);
                          alert(`✅ Successfully found Slab: ${uid}`);
                          return;
                        }

                        // If neither found, show error
                        setErrors([
                          `No Block or Slab found with ID: ${uid}. Please check the ID or create the block first.`,
                        ]);
                      }}
                      onError={(error) => setErrors([error])}
                      label="Scan QR Code for Block or Slab"
                      placeholder="UID will appear here after scanning"
                    />
                  </div>

                  <TestQRGenerator />

                  {/* Quick test with your actual block */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-800 mb-2">
                      🎯 Test with Your Block
                    </h3>
                    <p className="text-xs text-green-700 mb-3">
                      First create the block from your screenshot, then test
                      scanning:
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          // First create the block that matches your QR code
                          const matchingBlock = {
                            id: "6d0pms",
                            qrCode: JSON.stringify({
                              type: "block",
                              id: "6d0pms",
                              timestamp: new Date().toISOString(),
                              dimensions: {
                                length: 200,
                                width: 100,
                                height: 100,
                              },
                              thickness: 3,
                              estimatedSlabs: 31,
                            }),
                            dimensions: {
                              length: 200,
                              width: 100,
                              height: 100,
                            },
                            thickness: 3,
                            estimatedSlabs: 31,
                            actualSlabs: 0,
                            yield: 0,
                            createdAt: new Date().toISOString(),
                            createdBy: "az",
                            status: "active" as const,
                            notes: "Block created from QR test",
                          };

                          saveBlock(matchingBlock);
                          setBlocks(loadBlocks()); // Refresh blocks list
                          alert(
                            "✅ Block #6d0pms created successfully! Now you can scan it."
                          );
                        }}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                      >
                        1️⃣ Create Block #6d0pms
                      </button>

                      <button
                        onClick={() => {
                          const actualBlockData = JSON.stringify({
                            type: "block",
                            id: "6d0pms",
                            timestamp: new Date().toISOString(),
                            dimensions: {
                              length: 200,
                              width: 100,
                              height: 100,
                            },
                            thickness: 3,
                            estimatedSlabs: 31,
                          });
                          handleQRScan(actualBlockData);
                        }}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        2️⃣ Scan Block QR Code
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setShowCamera(true)}
                      className="p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors duration-200 text-center"
                    >
                      <div className="text-4xl mb-2">📷</div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        Use Camera
                      </h3>
                      <p className="text-sm text-gray-600">
                        Live camera scanning
                      </p>
                    </button>

                    <div className="p-6 border-2 border-dashed border-purple-300 rounded-lg">
                      <div className="text-4xl mb-2 text-center">🖼️</div>
                      <h3 className="font-medium text-gray-900 mb-2 text-center">
                        Upload Image
                      </h3>
                      <div className="space-y-3">
                        <QRImageUpload
                          onScan={handleQRScan}
                          onError={(error) => setErrors([error])}
                        />
                      </div>
                    </div>

                    <div className="p-6 border-2 border-dashed border-blue-300 rounded-lg">
                      <div className="text-4xl mb-2 text-center">⌨️</div>
                      <h3 className="font-medium text-gray-900 mb-2 text-center">
                        Manual Entry
                      </h3>
                      <div className="space-y-3">
                        <textarea
                          id="qrInput"
                          value={qrInput}
                          onChange={(e) => setQrInput(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                          placeholder="Paste QR code data here..."
                        />
                        <button
                          onClick={handleManualQRScan}
                          disabled={!qrInput.trim()}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                        >
                          Process QR Code
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          How to scan QR codes
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <ul className="list-disc list-inside space-y-1">
                            <li>
                              Click "Use Camera" to scan QR codes directly from
                              blocks or slabs
                            </li>
                            <li>
                              Use "Manual Entry" if you have QR code data to
                              paste
                            </li>
                            <li>
                              Ensure good lighting and hold steady for best
                              results
                            </li>
                            <li>
                              The system will automatically detect and process
                              valid QR codes
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Camera Scanner
                    </h3>
                    <button
                      onClick={() => setShowCamera(false)}
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

                  <QRScanner
                    onScan={handleQRScan}
                    onError={(error) => setErrors([error])}
                    isActive={showCamera}
                  />
                </div>
              )}
            </div>
          )}

          {/* Manual Selection Tab */}
          {activeTab === "manual" && (
            <div className="space-y-6">
              {!selectedBlock ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Select Block
                  </h2>

                  {blocks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No blocks available. Create a block first.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {blocks
                        .filter((b) => b.status === "active")
                        .map((block) => (
                          <div
                            key={block.id}
                            onClick={() => setSelectedBlock(block)}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">
                                  Block #{block.id.slice(-6)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {block.dimensions.length} ×{" "}
                                  {block.dimensions.width} ×{" "}
                                  {block.dimensions.height} cm
                                </p>
                                <p className="text-sm text-gray-500">
                                  Estimated: {block.estimatedSlabs} slabs |
                                  Actual: {block.actualSlabs} slabs
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-sm text-gray-500">
                                  Yield: {block.yield}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Selected Block Info */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Selected Block #{selectedBlock.id.slice(-6)}
                      </h2>
                      <button
                        onClick={() => {
                          setSelectedBlock(null);
                          setCurrentSlab(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p>
                          <strong>Dimensions:</strong>{" "}
                          {selectedBlock.dimensions.length} ×{" "}
                          {selectedBlock.dimensions.width} ×{" "}
                          {selectedBlock.dimensions.height} cm
                        </p>
                        <p>
                          <strong>Thickness:</strong> {selectedBlock.thickness}{" "}
                          cm
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Estimated Slabs:</strong>{" "}
                          {selectedBlock.estimatedSlabs}
                        </p>
                        <p>
                          <strong>Actual Slabs:</strong>{" "}
                          {selectedBlock.actualSlabs}
                        </p>
                        <p>
                          <strong>Current Yield:</strong> {selectedBlock.yield}%
                        </p>
                      </div>
                    </div>

                    {!currentSlab && (
                      <div className="mt-4">
                        <button
                          onClick={handleCreateSlab}
                          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                          Create New Slab for Inspection
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inspection Form */}
                  {currentSlab && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Inspect Slab #{currentSlab.id.slice(-6)}
                      </h3>

                      <form
                        onSubmit={handleInspectionSubmit}
                        className="space-y-6"
                      >
                        {/* Actual Dimensions */}
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-3">
                            Actual Dimensions (cm)
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Length
                              </label>
                              <input
                                type="number"
                                value={inspectionForm.length}
                                onChange={(e) =>
                                  setInspectionForm((prev) => ({
                                    ...prev,
                                    length: e.target.value,
                                  }))
                                }
                                step="0.1"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={currentSlab.estimatedDimensions.length.toString()}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Width
                              </label>
                              <input
                                type="number"
                                value={inspectionForm.width}
                                onChange={(e) =>
                                  setInspectionForm((prev) => ({
                                    ...prev,
                                    width: e.target.value,
                                  }))
                                }
                                step="0.1"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={currentSlab.estimatedDimensions.width.toString()}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thickness
                              </label>
                              <input
                                type="number"
                                value={inspectionForm.thickness}
                                onChange={(e) =>
                                  setInspectionForm((prev) => ({
                                    ...prev,
                                    thickness: e.target.value,
                                  }))
                                }
                                step="0.1"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={currentSlab.estimatedDimensions.thickness.toString()}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Quality Assessment */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Quality Grade
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(
                              [
                                "excellent",
                                "good",
                                "fair",
                                "defective",
                              ] as const
                            ).map((quality) => (
                              <label
                                key={quality}
                                className="flex items-center"
                              >
                                <input
                                  type="radio"
                                  name="quality"
                                  value={quality}
                                  checked={inspectionForm.quality === quality}
                                  onChange={(e) =>
                                    setInspectionForm((prev) => ({
                                      ...prev,
                                      quality: e.target.value as any,
                                    }))
                                  }
                                  className="mr-2"
                                />
                                <span
                                  className={`capitalize ${
                                    quality === "excellent"
                                      ? "text-green-600"
                                      : quality === "good"
                                      ? "text-blue-600"
                                      : quality === "fair"
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {quality}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Defects */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Defects (if any)
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {defectOptions.map((defect) => (
                              <label key={defect} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={inspectionForm.defects.includes(
                                    defect
                                  )}
                                  onChange={() => handleDefectToggle(defect)}
                                  className="mr-2"
                                />
                                <span className="text-sm">{defect}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Inspector and Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Inspector Name
                            </label>
                            <input
                              type="text"
                              value={inspectionForm.inspectedBy}
                              onChange={(e) =>
                                setInspectionForm((prev) => ({
                                  ...prev,
                                  inspectedBy: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter inspector name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <input
                              type="text"
                              value={inspectionForm.notes}
                              onChange={(e) =>
                                setInspectionForm((prev) => ({
                                  ...prev,
                                  notes: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Additional notes..."
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {isSubmitting
                            ? "Saving Inspection..."
                            : "Complete Inspection"}
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Block Slabs */}
          {selectedBlock && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Block Slabs
              </h3>

              {blockSlabs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No slabs created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {blockSlabs.map((slab) => (
                    <div
                      key={slab.id}
                      className="border-l-4 border-blue-500 pl-3 py-2"
                    >
                      <p className="font-medium text-sm">
                        #{slab.id.slice(-6)}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {slab.quality} | {slab.status}
                      </p>
                      {slab.defects.length > 0 && (
                        <p className="text-xs text-red-600">
                          {slab.defects.length} defect(s)
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Inspection Stats
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Slabs:</span>
                <span className="font-medium">{slabs.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-medium text-yellow-600">
                  {slabs.filter((s) => s.status === "pending").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Approved:</span>
                <span className="font-medium text-green-600">
                  {slabs.filter((s) => s.status === "approved").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rejected:</span>
                <span className="font-medium text-red-600">
                  {slabs.filter((s) => s.status === "rejected").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && currentSlab && (
        <QRCodeDisplay
          slab={currentSlab}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </div>
  );
}
