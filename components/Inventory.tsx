"use client";

import { useState, useEffect, useMemo } from "react";
import { Block, Slab, FilterOptions } from "../types";
import {
  loadBlocks,
  loadSlabs,
  deleteBlock,
  deleteSlab,
} from "../utils/storage";
import { formatDate, calculateSlabArea } from "../utils/calculations";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<"blocks" | "slabs">("blocks");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setBlocks(loadBlocks());
    setSlabs(loadSlabs());
  }, []);

  // Filter and sort blocks
  const filteredBlocks = useMemo(() => {
    let filtered = blocks.filter((block) => {
      if (filters.status && block.status !== filters.status) return false;

      if (filters.dateRange) {
        const createdDate = new Date(block.createdAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (createdDate < startDate || createdDate > endDate) return false;
      }

      if (filters.minDimensions) {
        if (
          filters.minDimensions.length &&
          block.dimensions.length < filters.minDimensions.length
        )
          return false;
        if (
          filters.minDimensions.width &&
          block.dimensions.width < filters.minDimensions.width
        )
          return false;
        if (
          filters.minDimensions.thickness &&
          block.thickness < filters.minDimensions.thickness
        )
          return false;
      }

      if (filters.maxDimensions) {
        if (
          filters.maxDimensions.length &&
          block.dimensions.length > filters.maxDimensions.length
        )
          return false;
        if (
          filters.maxDimensions.width &&
          block.dimensions.width > filters.maxDimensions.width
        )
          return false;
        if (
          filters.maxDimensions.thickness &&
          block.thickness > filters.maxDimensions.thickness
        )
          return false;
      }

      return true;
    });

    // Sort blocks
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "dimensions":
          aValue =
            a.dimensions.length * a.dimensions.width * a.dimensions.height;
          bValue =
            b.dimensions.length * b.dimensions.width * b.dimensions.height;
          break;
        case "estimatedSlabs":
          aValue = a.estimatedSlabs;
          bValue = b.estimatedSlabs;
          break;
        case "yield":
          aValue = a.yield;
          bValue = b.yield;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [blocks, filters, sortBy, sortOrder]);

  // Filter and sort slabs
  const filteredSlabs = useMemo(() => {
    let filtered = slabs.filter((slab) => {
      if (filters.status && slab.status !== filters.status) return false;
      if (filters.quality && slab.quality !== filters.quality) return false;
      if (filters.blockId && slab.blockId !== filters.blockId) return false;

      if (filters.dateRange && slab.inspectedAt) {
        const inspectedDate = new Date(slab.inspectedAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (inspectedDate < startDate || inspectedDate > endDate) return false;
      }

      return true;
    });

    // Sort slabs
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "inspectedAt":
          aValue = a.inspectedAt ? new Date(a.inspectedAt).getTime() : 0;
          bValue = b.inspectedAt ? new Date(b.inspectedAt).getTime() : 0;
          break;
        case "quality":
          const qualityOrder = { excellent: 4, good: 3, fair: 2, defective: 1 };
          aValue = qualityOrder[a.quality];
          bValue = qualityOrder[b.quality];
          break;
        case "area":
          aValue = a.actualDimensions
            ? calculateSlabArea(
                a.actualDimensions.length,
                a.actualDimensions.width
              )
            : calculateSlabArea(
                a.estimatedDimensions.length,
                a.estimatedDimensions.width
              );
          bValue = b.actualDimensions
            ? calculateSlabArea(
                b.actualDimensions.length,
                b.actualDimensions.width
              )
            : calculateSlabArea(
                b.estimatedDimensions.length,
                b.estimatedDimensions.width
              );
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [slabs, filters, sortBy, sortOrder]);

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const items = activeTab === "blocks" ? filteredBlocks : filteredSlabs;
    const allIds = items.map((item) => item.id);

    if (selectedItems.length === allIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allIds);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedItems.length} selected ${activeTab}?`
    );

    if (!confirmDelete) return;

    selectedItems.forEach((id) => {
      if (activeTab === "blocks") {
        deleteBlock(id);
      } else {
        deleteSlab(id);
      }
    });

    // Reload data
    setBlocks(loadBlocks());
    setSlabs(loadSlabs());
    setSelectedItems([]);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const exportData = () => {
    const data = activeTab === "blocks" ? filteredBlocks : filteredSlabs;
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${activeTab}_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Inventory Management
        </h1>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            🔍 Filters
          </button>
          <button
            onClick={exportData}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
          >
            📥 Export
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => {
              setActiveTab("blocks");
              setSelectedItems([]);
            }}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === "blocks"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🧱 Blocks ({blocks.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("slabs");
              setSelectedItems([]);
            }}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === "slabs"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📋 Slabs ({slabs.length})
          </button>
        </nav>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value || undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {activeTab === "blocks" ? (
                  <>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </>
                ) : (
                  <>
                    <option value="pending">Pending</option>
                    <option value="inspected">Inspected</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
              </select>
            </div>

            {/* Quality Filter (Slabs only) */}
            {activeTab === "slabs" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality
                </label>
                <select
                  value={filters.quality || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      quality: e.target.value || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Qualities</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="defective">Defective</option>
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.start || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.end || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={
                  selectedItems.length > 0 &&
                  selectedItems.length ===
                    (activeTab === "blocks" ? filteredBlocks : filteredSlabs)
                      .length
                }
                onChange={handleSelectAll}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">
                {selectedItems.length > 0
                  ? `${selectedItems.length} selected`
                  : "Select all"}
              </span>
            </div>

            {selectedItems.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition-colors duration-200"
              >
                🗑️ Delete Selected
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {activeTab === "blocks" ? (
                  <>
                    <option value="createdAt">Created Date</option>
                    <option value="dimensions">Size</option>
                    <option value="estimatedSlabs">Estimated Slabs</option>
                    <option value="yield">Yield</option>
                  </>
                ) : (
                  <>
                    <option value="inspectedAt">Inspection Date</option>
                    <option value="quality">Quality</option>
                    <option value="area">Area</option>
                  </>
                )}
              </select>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="p-1 text-gray-600 hover:text-gray-900"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md">
        {activeTab === "blocks" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length > 0 &&
                        selectedItems.length === filteredBlocks.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Block ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dimensions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slabs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yield
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlocks.map((block) => (
                  <tr key={block.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(block.id)}
                        onChange={() => handleSelectItem(block.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{block.id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {block.dimensions.length} × {block.dimensions.width} ×{" "}
                      {block.dimensions.height} cm
                      <br />
                      <span className="text-xs text-gray-400">
                        Thickness: {block.thickness}cm
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {block.actualSlabs} / {block.estimatedSlabs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          block.yield >= 90
                            ? "bg-green-100 text-green-800"
                            : block.yield >= 70
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {block.yield}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          block.status === "active"
                            ? "bg-green-100 text-green-800"
                            : block.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {block.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(block.createdAt)}
                      <br />
                      <span className="text-xs text-gray-400">
                        by {block.createdBy}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this block?"
                            )
                          ) {
                            deleteBlock(block.id);
                            setBlocks(loadBlocks());
                            setSlabs(loadSlabs());
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBlocks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No blocks found matching your criteria.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length > 0 &&
                        selectedItems.length === filteredSlabs.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slab ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Block ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dimensions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSlabs.map((slab) => {
                  const dims =
                    slab.actualDimensions || slab.estimatedDimensions;
                  return (
                    <tr key={slab.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(slab.id)}
                          onChange={() => handleSelectItem(slab.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{slab.id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{slab.blockId.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dims.length} × {dims.width} × {dims.thickness} cm
                        <br />
                        <span className="text-xs text-gray-400">
                          Area:{" "}
                          {calculateSlabArea(dims.length, dims.width).toFixed(
                            2
                          )}{" "}
                          cm²
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                        {slab.defects.length > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {slab.defects.length} defect(s)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            slab.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : slab.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : slab.status === "inspected"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {slab.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {slab.inspectedAt ? (
                          <>
                            {formatDate(slab.inspectedAt)}
                            <br />
                            <span className="text-xs text-gray-400">
                              by {slab.inspectedBy}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400">Not inspected</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this slab?"
                              )
                            ) {
                              deleteSlab(slab.id);
                              setSlabs(loadSlabs());
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredSlabs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No slabs found matching your criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
