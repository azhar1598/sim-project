export interface Block {
  id: string;
  qrCode: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  thickness: number;
  estimatedSlabs: number;
  actualSlabs: number;
  yield: number;
  createdAt: string;
  createdBy: string;
  status: "active" | "completed" | "archived";
  notes?: string;
}

export interface Slab {
  id: string;
  blockId: string;
  qrCode: string;
  estimatedDimensions: {
    length: number;
    width: number;
    thickness: number;
  };
  actualDimensions?: {
    length: number;
    width: number;
    thickness: number;
  };
  quality: "excellent" | "good" | "fair" | "defective";
  defects: string[];
  inspectedAt?: string;
  inspectedBy?: string;
  status: "pending" | "inspected" | "approved" | "rejected";
  discrepancies: string[];
  notes?: string;
}

export interface YieldComparison {
  blockId: string;
  estimatedSlabs: number;
  actualSlabs: number;
  yieldPercentage: number;
  discrepancyReasons: string[];
  qualityDistribution: {
    excellent: number;
    good: number;
    fair: number;
    defective: number;
  };
}

export interface InventoryStats {
  totalBlocks: number;
  activeBlocks: number;
  completedBlocks: number;
  totalSlabs: number;
  pendingInspection: number;
  approvedSlabs: number;
  rejectedSlabs: number;
  averageYield: number;
}

export interface FilterOptions {
  status?: string;
  quality?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  blockId?: string;
  minDimensions?: {
    length?: number;
    width?: number;
    thickness?: number;
  };
  maxDimensions?: {
    length?: number;
    width?: number;
    thickness?: number;
  };
}
