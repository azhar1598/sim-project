"use client";

import { useState, useEffect, useMemo } from "react";
import { Block, Slab, YieldComparison } from "../types";
import { loadBlocks, loadSlabs } from "../utils/storage";
import { calculateYieldPercentage, formatDate } from "../utils/calculations";
import { useTranslation } from "../contexts/LanguageContext";

export default function Analytics() {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");
  const [activeTab, setActiveTab] = useState<"yield" | "quality" | "trends">(
    "yield"
  );

  useEffect(() => {
    setBlocks(loadBlocks());
    setSlabs(loadSlabs());
  }, []);

  // Calculate yield comparisons
  const yieldComparisons = useMemo(() => {
    return blocks.map((block) => {
      const blockSlabs = slabs.filter(
        (s) => s.blockId === block.id && s.status !== "pending"
      );

      const qualityDistribution = {
        excellent: blockSlabs.filter((s) => s.quality === "excellent").length,
        good: blockSlabs.filter((s) => s.quality === "good").length,
        fair: blockSlabs.filter((s) => s.quality === "fair").length,
        defective: blockSlabs.filter((s) => s.quality === "defective").length,
      };

      const discrepancyReasons = blockSlabs
        .flatMap((s) => s.discrepancies)
        .filter((d) => d.length > 0);

      return {
        blockId: block.id,
        estimatedSlabs: block.estimatedSlabs,
        actualSlabs: blockSlabs.length,
        yieldPercentage: calculateYieldPercentage(
          block.estimatedSlabs,
          blockSlabs.length
        ),
        discrepancyReasons,
        qualityDistribution,
        block,
      } as YieldComparison & { block: Block };
    });
  }, [blocks, slabs]);

  // Filter data by selected period
  const filteredData = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (selectedPeriod) {
      case "week":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return {
      blocks: blocks.filter((b) => new Date(b.createdAt) >= cutoffDate),
      slabs: slabs.filter(
        (s) => s.inspectedAt && new Date(s.inspectedAt) >= cutoffDate
      ),
      yieldComparisons: yieldComparisons.filter(
        (yc) => new Date(yc.block.createdAt) >= cutoffDate
      ),
    };
  }, [blocks, slabs, yieldComparisons, selectedPeriod]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalEstimated = filteredData.yieldComparisons.reduce(
      (sum, yc) => sum + yc.estimatedSlabs,
      0
    );
    const totalActual = filteredData.yieldComparisons.reduce(
      (sum, yc) => sum + yc.actualSlabs,
      0
    );
    const averageYield =
      totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;

    const totalSlabs = filteredData.slabs.length;
    const qualityDistribution = {
      excellent: filteredData.slabs.filter((s) => s.quality === "excellent")
        .length,
      good: filteredData.slabs.filter((s) => s.quality === "good").length,
      fair: filteredData.slabs.filter((s) => s.quality === "fair").length,
      defective: filteredData.slabs.filter((s) => s.quality === "defective")
        .length,
    };

    const defectRate =
      totalSlabs > 0
        ? Math.round((qualityDistribution.defective / totalSlabs) * 100)
        : 0;

    return {
      totalBlocks: filteredData.blocks.length,
      totalEstimated,
      totalActual,
      averageYield,
      totalSlabs,
      qualityDistribution,
      defectRate,
    };
  }, [filteredData]);

  // Most common discrepancies
  const discrepancyAnalysis = useMemo(() => {
    const allDiscrepancies = filteredData.yieldComparisons.flatMap(
      (yc) => yc.discrepancyReasons
    );
    const discrepancyCount = allDiscrepancies.reduce((acc, disc) => {
      acc[disc] = (acc[disc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(discrepancyCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [filteredData.yieldComparisons]);

  // Yield trends
  const yieldTrends = useMemo(() => {
    const blocksByMonth = filteredData.yieldComparisons.reduce((acc, yc) => {
      const month = new Date(yc.block.createdAt).toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { estimated: 0, actual: 0, count: 0 };
      }
      acc[month].estimated += yc.estimatedSlabs;
      acc[month].actual += yc.actualSlabs;
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, { estimated: number; actual: number; count: number }>);

    return Object.entries(blocksByMonth)
      .map(([month, data]) => ({
        month,
        yield:
          data.estimated > 0
            ? Math.round((data.actual / data.estimated) * 100)
            : 0,
        blocks: data.count,
        estimated: data.estimated,
        actual: data.actual,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData.yieldComparisons]);

  const StatCard = ({
    title,
    value,
    subtitle,
    color,
    trend,
  }: {
    title: string;
    value: number | string;
    subtitle?: string;
    color: string;
    trend?: number;
  }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {trend !== undefined && (
          <div
            className={`text-sm font-medium ${
              trend >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend >= 0 ? "↗️" : "↘️"} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("analytics.title")}
        </h1>

        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Average Yield"
          value={`${overallStats.averageYield}%`}
          subtitle={`${overallStats.totalActual}/${overallStats.totalEstimated} slabs`}
          color="border-blue-500"
        />
        <StatCard
          title="Total Blocks"
          value={overallStats.totalBlocks}
          subtitle="in selected period"
          color="border-green-500"
        />
        <StatCard
          title="Quality Rate"
          value={`${100 - overallStats.defectRate}%`}
          subtitle={`${overallStats.defectRate}% defective`}
          color="border-purple-500"
        />
        <StatCard
          title="Total Slabs"
          value={overallStats.totalSlabs}
          subtitle="inspected"
          color="border-yellow-500"
        />
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: "yield", label: "Yield Analysis", icon: "📊" },
            { id: "quality", label: "Quality Distribution", icon: "⭐" },
            { id: "trends", label: "Trends", icon: "📈" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "yield" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Yield Comparison Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Block Yield Comparison
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Block
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Est.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actual
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yield
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.yieldComparisons.slice(0, 10).map((yc) => (
                    <tr key={yc.blockId} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{yc.blockId.slice(-6)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {yc.estimatedSlabs}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {yc.actualSlabs}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            yc.yieldPercentage >= 90
                              ? "bg-green-100 text-green-800"
                              : yc.yieldPercentage >= 70
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {yc.yieldPercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discrepancy Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Common Discrepancies
            </h2>

            {discrepancyAnalysis.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No discrepancies recorded
              </p>
            ) : (
              <div className="space-y-3">
                {discrepancyAnalysis.map(([discrepancy, count], index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-900">{discrepancy}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "quality" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quality Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quality Distribution
            </h2>

            <div className="space-y-4">
              {Object.entries(overallStats.qualityDistribution).map(
                ([quality, count]) => {
                  const percentage =
                    overallStats.totalSlabs > 0
                      ? Math.round((count / overallStats.totalSlabs) * 100)
                      : 0;

                  return (
                    <div key={quality} className="flex items-center">
                      <div className="w-20 text-sm text-gray-600 capitalize">
                        {quality}:
                      </div>
                      <div className="flex-1 mx-3">
                        <div className="bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full ${
                              quality === "excellent"
                                ? "bg-green-500"
                                : quality === "good"
                                ? "bg-blue-500"
                                : quality === "fair"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-sm text-gray-900 text-right">
                        {count} ({percentage}%)
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Quality by Block */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quality by Block
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Block
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Excellent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Good
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fair
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Defective
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.yieldComparisons.slice(0, 10).map((yc) => (
                    <tr key={yc.blockId} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{yc.blockId.slice(-6)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600">
                        {yc.qualityDistribution.excellent}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600">
                        {yc.qualityDistribution.good}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-yellow-600">
                        {yc.qualityDistribution.fair}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">
                        {yc.qualityDistribution.defective}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "trends" && (
        <div className="space-y-8">
          {/* Yield Trends */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Yield Trends Over Time
            </h2>

            {yieldTrends.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Not enough data for trend analysis
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blocks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estimated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yield
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {yieldTrends.map((trend) => (
                      <tr key={trend.month} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(trend.month + "-01").toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trend.blocks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trend.estimated}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trend.actual}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              trend.yield >= 90
                                ? "bg-green-100 text-green-800"
                                : trend.yield >= 70
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {trend.yield}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Performance Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Best Performing Block
                </h3>
                {filteredData.yieldComparisons.length > 0 ? (
                  (() => {
                    const best = filteredData.yieldComparisons.reduce(
                      (prev, current) =>
                        current.yieldPercentage > prev.yieldPercentage
                          ? current
                          : prev
                    );
                    return (
                      <div className="text-sm text-blue-800">
                        <p>Block #{best.blockId.slice(-6)}</p>
                        <p>
                          Yield: {best.yieldPercentage}% ({best.actualSlabs}/
                          {best.estimatedSlabs})
                        </p>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-sm text-blue-800">No data available</p>
                )}
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-medium text-red-900 mb-2">
                  Needs Improvement
                </h3>
                {filteredData.yieldComparisons.length > 0 ? (
                  (() => {
                    const worst = filteredData.yieldComparisons.reduce(
                      (prev, current) =>
                        current.yieldPercentage < prev.yieldPercentage
                          ? current
                          : prev
                    );
                    return (
                      <div className="text-sm text-red-800">
                        <p>Block #{worst.blockId.slice(-6)}</p>
                        <p>
                          Yield: {worst.yieldPercentage}% ({worst.actualSlabs}/
                          {worst.estimatedSlabs})
                        </p>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-sm text-red-800">No data available</p>
                )}
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">
                  Quality Leader
                </h3>
                {filteredData.slabs.length > 0 ? (
                  <div className="text-sm text-green-800">
                    <p>
                      {overallStats.qualityDistribution.excellent} excellent
                      slabs
                    </p>
                    <p>
                      {Math.round(
                        (overallStats.qualityDistribution.excellent /
                          overallStats.totalSlabs) *
                          100
                      )}
                      % excellence rate
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-green-800">No data available</p>
                )}
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">
                  Total Production
                </h3>
                <div className="text-sm text-yellow-800">
                  <p>{overallStats.totalBlocks} blocks processed</p>
                  <p>{overallStats.totalSlabs} slabs produced</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
