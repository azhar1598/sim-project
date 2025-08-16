"use client";

import { useEffect, useState } from "react";
import { Block, Slab, InventoryStats } from "../types";
import { loadBlocks, loadSlabs } from "../utils/storage";
import { calculateInventoryStats, formatDate } from "../utils/calculations";
import { useTranslation } from "../contexts/LanguageContext";

export default function Dashboard() {
  const { t } = useTranslation();
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
    icon,
    trend,
  }: {
    title: string;
    value: number | string;
    subtitle?: string;
    color: string;
    icon?: React.ReactNode;
    trend?: { value: number; isUp: boolean };
  }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  trend.isUp
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <svg
                  className={`w-3 h-3 mr-1 ${
                    trend.isUp ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 14l-7-7m0 0l-7 7m7-7v18"
                  />
                </svg>
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
        </div>
        {icon && (
          <div
            className={`p-4 rounded-2xl ${color} flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <div className="text-white">{icon}</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border border-gray-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              {t("dashboard.title")}
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("dashboard.total_blocks")}
          value={stats.totalBlocks}
          subtitle={`${stats.activeBlocks} ${t("dashboard.active_blocks")}`}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
          trend={{ value: 12, isUp: true }}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
          }
        />
        <StatCard
          title={t("dashboard.total_slabs")}
          value={stats.totalSlabs}
          subtitle={`${stats.pendingInspection} ${t(
            "dashboard.pending_inspection"
          )}`}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
          trend={{ value: 8, isUp: true }}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v9a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V9a2.25 2.25 0 0 0-1.5-2.122M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v9a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V9a2.25 2.25 0 0 0-1.5-2.122"
              />
            </svg>
          }
        />
        <StatCard
          title={t("dashboard.average_yield")}
          value={`${stats.averageYield}%`}
          color="bg-gradient-to-br from-yellow-500 to-orange-600"
          trend={{ value: 3, isUp: false }}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
              />
            </svg>
          }
        />
        <StatCard
          title={t("dashboard.approved_slabs")}
          value={stats.approvedSlabs}
          subtitle={`${stats.rejectedSlabs} ${t("dashboard.rejected")}`}
          color="bg-gradient-to-br from-purple-500 to-violet-600"
          trend={{ value: 15, isUp: true }}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Blocks */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                  />
                </svg>
              </div>
              {t("dashboard.recent_blocks")}
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("common.view_all")}
            </button>
          </div>
          <div className="space-y-4">
            {recentBlocks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {t("dashboard.no_blocks_yet")}
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              {t("dashboard.recent_inspections")}
            </h2>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
              {t("common.view_all")}
            </button>
          </div>
          <div className="space-y-4">
            {recentSlabs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {t("dashboard.no_inspections_yet")}
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
