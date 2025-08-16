"use client";

import { useState, useEffect } from "react";
import { Block } from "../types";
import { saveBlock, loadBlocks } from "../utils/storage";
import {
  generateId,
  calculateEstimatedSlabs,
  validateDimensions,
  generateQRCodeData,
} from "../utils/calculations";
import QRCodeDisplay from "./QRCodeDisplay";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import QRUIDScanner from "./QRUIDScanner";
import { useTranslation } from "../contexts/LanguageContext";

export default function BlockEntry() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    blockId: "",
    length: "",
    width: "",
    height: "",
    thickness: "3",
    createdBy: "",
    notes: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBlock, setCreatedBlock] = useState<Block | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);

  useEffect(() => {
    // Load recent blocks
    const blocks = loadBlocks();
    setRecentBlocks(
      blocks
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10)
    );
  }, [createdBlock]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleUIDScanned = (uid: string) => {
    setFormData((prev) => ({
      ...prev,
      blockId: uid,
    }));
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      const length = parseFloat(formData.length);
      const width = parseFloat(formData.width);
      const height = parseFloat(formData.height);
      const thickness = parseFloat(formData.thickness);

      // Validate inputs
      const validationErrors = validateDimensions(
        length,
        width,
        height,
        thickness
      );
      if (!formData.blockId.trim()) {
        validationErrors.push("Block ID is required - please scan a QR code");
      }
      if (!formData.createdBy.trim()) {
        validationErrors.push("Created by field is required");
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      // Use the scanned Block ID
      const blockId = formData.blockId;
      const estimatedSlabs = calculateEstimatedSlabs(
        length,
        width,
        height,
        thickness
      );
      const qrCodeData = generateQRCodeData("block", blockId, {
        dimensions: { length, width, height },
        thickness,
        estimatedSlabs,
      });

      const newBlock: Block = {
        id: blockId,
        qrCode: qrCodeData,
        dimensions: { length, width, height },
        thickness,
        estimatedSlabs,
        actualSlabs: 0,
        yield: 0,
        createdAt: new Date().toISOString(),
        createdBy: formData.createdBy.trim(),
        status: "active",
        notes: formData.notes.trim() || undefined,
      };

      // Save block
      saveBlock(newBlock);
      setCreatedBlock(newBlock);
      setShowQRCode(true);

      // Reset form
      setFormData({
        length: "",
        width: "",
        height: "",
        thickness: "3",
        createdBy: formData.createdBy, // Keep the name for convenience
        notes: "",
      });
    } catch (error) {
      setErrors([
        "An error occurred while creating the block. Please try again.",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedSlabs =
    formData.length && formData.width && formData.height && formData.thickness
      ? calculateEstimatedSlabs(
          parseFloat(formData.length) || 0,
          parseFloat(formData.width) || 0,
          parseFloat(formData.height) || 0,
          parseFloat(formData.thickness) || 0
        )
      : 0;

  const blockVolume =
    formData.length && formData.width && formData.height
      ? ((parseFloat(formData.length) || 0) *
          (parseFloat(formData.width) || 0) *
          (parseFloat(formData.height) || 0)) /
        1000000 // Convert to cubic meters
      : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t("blocks.title")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t("blocks.add_new_block")}
            </h2>

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
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following errors:
                    </h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* QR Code Scanner */}
              <div>
                <QRUIDScanner
                  onUIDScanned={handleUIDScanned}
                  onError={(error) => setErrors([error])}
                  label={t("blocks.scan_qr_code")}
                  placeholder={t("blocks.block_id_placeholder")}
                />
              </div>

              {/* Block ID Input (for manual entry or display) */}
              <Input
                label={t("blocks.block_id")}
                type="text"
                name="blockId"
                value={formData.blockId}
                onChange={handleInputChange}
                placeholder={t("blocks.block_id_placeholder")}
                className="font-mono"
              />

              {/* Dimensions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t("blocks.dimensions")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t("blocks.length")}
                    type="number"
                    name="length"
                    value={formData.length}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    placeholder="e.g., 200"
                  />
                  <Input
                    label={t("blocks.width")}
                    type="number"
                    name="width"
                    value={formData.width}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    placeholder="e.g., 120"
                  />
                  <Input
                    label={t("blocks.height")}
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    placeholder="e.g., 60"
                  />
                </div>
              </div>

              {/* Slab Thickness */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t("blocks.slab_thickness")}
                  type="number"
                  name="thickness"
                  value={formData.thickness}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0.1"
                  placeholder="e.g., 3"
                />
                <div className="flex items-end">
                  <p className="text-sm text-gray-500 pb-2">
                    Standard thickness is usually 2-4 cm
                  </p>
                </div>
              </div>

              {/* Created By */}
              <Input
                label="Created By"
                type="text"
                name="createdBy"
                value={formData.createdBy}
                onChange={handleInputChange}
                placeholder="Enter your name or ID"
                className="md:max-w-md"
              />

              {/* Notes */}
              <Textarea
                label={t("blocks.notes")}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder={t("blocks.notes_placeholder")}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting
                  ? "Creating Block..."
                  : "Create Block & Generate QR Code"}
              </button>
            </form>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {/* Calculations Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preview
            </h3>

            {formData.length && formData.width && formData.height ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-medium">
                    {blockVolume.toFixed(2)} m³
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Slabs:</span>
                  <span className="font-medium text-blue-600">
                    {estimatedSlabs}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Based on {formData.thickness || 3}cm thickness with 5% waste
                    margin
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Enter dimensions to see preview
              </p>
            )}
          </div>

          {/* Recent Blocks */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Blocks
            </h3>

            {recentBlocks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No blocks created yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentBlocks.slice(0, 5).map((block) => (
                  <div
                    key={block.id}
                    className="border-l-4 border-blue-500 pl-3 py-2"
                  >
                    <p className="font-medium text-sm">#{block.id.slice(-6)}</p>
                    <p className="text-xs text-gray-600">
                      {block.dimensions.length}×{block.dimensions.width}×
                      {block.dimensions.height}cm
                    </p>
                    <p className="text-xs text-gray-500">
                      {block.estimatedSlabs} slabs
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && createdBlock && (
        <QRCodeDisplay
          block={createdBlock}
          onClose={() => {
            setShowQRCode(false);
            setCreatedBlock(null);
          }}
        />
      )}
    </div>
  );
}
