import { Block, Slab } from "../types";

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Calculate estimated slabs from block dimensions
export const calculateEstimatedSlabs = (
  length: number,
  width: number,
  height: number,
  thickness: number
): number => {
  if (thickness <= 0 || height <= 0) return 0;

  // Account for cutting waste (typically 5-10%)
  const wasteMargin = 0.95;
  const availableHeight = height * wasteMargin;

  return Math.floor(availableHeight / thickness);
};

// Calculate block volume
export const calculateBlockVolume = (
  length: number,
  width: number,
  height: number
): number => {
  return length * width * height;
};

// Calculate slab area
export const calculateSlabArea = (length: number, width: number): number => {
  return length * width;
};

// Calculate yield percentage
export const calculateYieldPercentage = (
  estimatedSlabs: number,
  actualSlabs: number
): number => {
  if (estimatedSlabs === 0) return 0;
  return Math.round((actualSlabs / estimatedSlabs) * 100);
};

// Generate QR code data
export const generateQRCodeData = (
  type: "block" | "slab",
  id: string,
  data: any
): string => {
  const qrData = {
    type,
    id,
    timestamp: new Date().toISOString(),
    ...data,
  };

  return JSON.stringify(qrData);
};

// Parse QR code data
export const parseQRCodeData = (qrString: string): any => {
  try {
    // First try to parse as JSON (legacy format)
    return JSON.parse(qrString);
  } catch (error) {
    // If not JSON, try to parse as URL with UID parameter
    return parseQRCodeURL(qrString);
  }
};

// Parse QR code URL to extract UID
export const parseQRCodeURL = (qrData: string) => {
  try {
    // Check if it's a URL format like https://app.stonefactory.com?UID=JK68DEFE234HJE
    const url = new URL(qrData);
    const uid = url.searchParams.get("UID");

    if (uid) {
      return {
        type: "uid",
        id: uid,
        originalUrl: qrData,
      };
    }

    // If no UID parameter found, return null
    return null;
  } catch (error) {
    // If not a valid URL, check if it's just a plain UID string
    if (typeof qrData === "string" && qrData.length > 0) {
      return {
        type: "uid",
        id: qrData.trim(),
        originalUrl: null,
      };
    }

    console.error("Invalid QR code data:", error);
    return null;
  }
};

// Calculate inventory statistics
export const calculateInventoryStats = (blocks: Block[], slabs: Slab[]) => {
  const totalBlocks = blocks.length;
  const activeBlocks = blocks.filter((b) => b.status === "active").length;
  const completedBlocks = blocks.filter((b) => b.status === "completed").length;

  const totalSlabs = slabs.length;
  const pendingInspection = slabs.filter((s) => s.status === "pending").length;
  const approvedSlabs = slabs.filter((s) => s.status === "approved").length;
  const rejectedSlabs = slabs.filter((s) => s.status === "rejected").length;

  const totalEstimatedSlabs = blocks.reduce(
    (sum, block) => sum + block.estimatedSlabs,
    0
  );
  const totalActualSlabs = blocks.reduce(
    (sum, block) => sum + block.actualSlabs,
    0
  );
  const averageYield =
    totalEstimatedSlabs > 0
      ? Math.round((totalActualSlabs / totalEstimatedSlabs) * 100)
      : 0;

  return {
    totalBlocks,
    activeBlocks,
    completedBlocks,
    totalSlabs,
    pendingInspection,
    approvedSlabs,
    rejectedSlabs,
    averageYield,
  };
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Validate dimensions
export const validateDimensions = (
  length: number,
  width: number,
  height: number,
  thickness?: number
): string[] => {
  const errors: string[] = [];

  if (length <= 0) errors.push("Length must be greater than 0");
  if (width <= 0) errors.push("Width must be greater than 0");
  if (height <= 0) errors.push("Height must be greater than 0");
  if (thickness !== undefined && thickness <= 0)
    errors.push("Thickness must be greater than 0");

  return errors;
};
