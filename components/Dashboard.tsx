"use client";

import { useEffect, useState } from "react";
import { Block, Slab, InventoryStats } from "../types";
import { loadBlocks, loadSlabs } from "../utils/storage";
import { calculateInventoryStats, formatDate } from "../utils/calculations";

export default function Dashboard() {
  const [stats, setStats] = useState<InventoryStats>({
    totalBlocks: 0,
    activeBlocks: 0,
    completedBlocks: 0,
    totalSlabs: 0,
    pendingInspection: 0,
    approvedSlabs: 0,
    rejectedSlabs: 0,
    averageYield: 0,
  });
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);
  const [recentSlabs, setRecentSlabs] = useState<Slab[]>([]);

  useEffect(() => {
    const blocks = loadBlocks();
    const slabs = loadSlabs();

    setStats(calculateInventoryStats(blocks, slabs));

    // Get 5 most recent blocks
    setRecentBlocks(
      blocks
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5)
    );

    // Get 5 most recent slabs
    setRecentSlabs(
      slabs
        .sort(
          (a, b) =>
            new Date(b.inspectedAt || "").getTime() -
            new Date(a.inspectedAt || "").getTime()
        )
        .slice(0, 5)
    );
  }, []);

  const StatCard = ({
    title,
    value,
    subtitle,
    color,
  }: {
    title: string;
    value: number | string;
    subtitle?: string;
    color: string;
  }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Dashboard Overview
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Blocks"
          value={stats.totalBlocks}
          subtitle={`${stats.activeBlocks} active`}
          color="border-blue-500"
        />
        <StatCard
          title="Total Slabs"
          value={stats.totalSlabs}
          subtitle={`${stats.pendingInspection} pending`}
          color="border-green-500"
        />
        <StatCard
          title="Average Yield"
          value={`${stats.averageYield}%`}
          color="border-yellow-500"
        />
        <StatCard
          title="Approved Slabs"
          value={stats.approvedSlabs}
          subtitle={`${stats.rejectedSlabs} rejected`}
          color="border-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Blocks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Blocks
          </h2>
          <div className="space-y-4">
            {recentBlocks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No blocks created yet
              </p>
            ) : (
              recentBlocks.map((block) => (
                <div
                  key={block.id}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        Block #{block.id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {block.dimensions.length} × {block.dimensions.width} ×{" "}
                        {block.dimensions.height} cm
                      </p>
                      <p className="text-sm text-gray-500">
                        Est. {block.estimatedSlabs} slabs | Created{" "}
                        {formatDate(block.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        block.status === "active"
                          ? "bg-green-100 text-green-800"
                          : block.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {block.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Inspections */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Inspections
          </h2>
          <div className="space-y-4">
            {recentSlabs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No inspections completed yet
              </p>
            ) : (
              recentSlabs.map((slab) => (
                <div
                  key={slab.id}
                  className="border-l-4 border-green-500 pl-4 py-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        Slab #{slab.id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Block #{slab.blockId.slice(-6)}
                      </p>
                      {slab.inspectedAt && (
                        <p className="text-sm text-gray-500">
                          Inspected {formatDate(slab.inspectedAt)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          slab.quality === "excellent"
                            ? "bg-green-100 text-green-800"
                            : slab.quality === "good"
                            ? "bg-blue-100 text-blue-800"
                            : slab.quality === "fair"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {slab.quality}
                      </span>
                      <p
                        className={`text-xs mt-1 ${
                          slab.status === "approved"
                            ? "text-green-600"
                            : slab.status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {slab.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200">
            <div className="text-center">
              <div className="text-3xl mb-2">🧱</div>
              <h3 className="font-medium text-gray-900">Add New Block</h3>
              <p className="text-sm text-gray-600 mt-1">
                Start tracking a new stone block
              </p>
            </div>
          </button>

          <button className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors duration-200">
            <div className="text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-medium text-gray-900">Inspect Slab</h3>
              <p className="text-sm text-gray-600 mt-1">
                Scan QR and inspect slab quality
              </p>
            </div>
          </button>

          <button className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200">
            <div className="text-center">
              <div className="text-3xl mb-2">📦</div>
              <h3 className="font-medium text-gray-900">View Inventory</h3>
              <p className="text-sm text-gray-600 mt-1">
                Browse all blocks and slabs
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
