"use client";

import { useState } from "react";
import { generateQRCodeData } from "../utils/calculations";

export default function TestQRGenerator() {
  const [testData, setTestData] = useState("");

  const generateTestBlock = () => {
    // Generate data that matches your actual block from the screenshot
    const testBlockData = generateQRCodeData("block", "6d0pms", {
      dimensions: { length: 200, width: 100, height: 100 },
      thickness: 3,
      estimatedSlabs: 31,
    });
    setTestData(testBlockData);
  };

  const generateTestSlab = () => {
    const testSlabData = generateQRCodeData("slab", "test-slab-456", {
      blockId: "test-block-123",
      estimatedDimensions: { length: 200, width: 120, thickness: 3 },
    });
    setTestData(testSlabData);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">
        🧪 Test QR Scanner
      </h3>
      <p className="text-xs text-yellow-700 mb-3">
        Generate test QR data to test the scanner functionality:
      </p>

      <div className="flex space-x-2 mb-3">
        <button
          onClick={generateTestBlock}
          className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
        >
          Generate Test Block
        </button>
        <button
          onClick={generateTestSlab}
          className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
        >
          Generate Test Slab
        </button>
      </div>

      {testData && (
        <div>
          <label className="block text-xs font-medium text-yellow-800 mb-1">
            Test QR Data (copy and paste into manual entry):
          </label>
          <textarea
            value={testData}
            readOnly
            rows={3}
            className="w-full text-xs p-2 border border-yellow-300 rounded bg-white"
            onClick={(e) => {
              e.currentTarget.select();
              navigator.clipboard.writeText(testData);
            }}
          />
          <p className="text-xs text-yellow-600 mt-1">
            Click the textarea to copy the data, then paste it in the manual
            entry field above.
          </p>
        </div>
      )}
    </div>
  );
}
