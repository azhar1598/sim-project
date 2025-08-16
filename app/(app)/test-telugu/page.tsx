"use client";

import { useTranslation, useLanguage } from "../../../contexts/LanguageContext";

export default function TeluguTestPage() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border border-gray-200/60">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
          Telugu Translation Demo
        </h1>
        <p className="text-gray-600 text-lg">
          Current Language:{" "}
          <span className="font-semibold">
            {language === "te" ? "తెలుగు (Telugu)" : "English"}
          </span>
        </p>
      </div>

      {/* Quick Language Switch */}
      <div className="flex gap-4">
        <button
          onClick={() => setLanguage("en")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            language === "en"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          🇺🇸 English
        </button>
        <button
          onClick={() => setLanguage("te")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            language === "te"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          🇮🇳 తెలుగు
        </button>
      </div>

      {/* Translation Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Navigation Terms */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t("navigation.main_menu")}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{t("navigation.dashboard")}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t("navigation.blocks")}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>{t("navigation.slabs")}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>{t("navigation.inventory")}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>{t("navigation.analytics")}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Terms */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t("dashboard.title")}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>{t("dashboard.total_blocks")}:</span>
              <span className="font-semibold">25</span>
            </div>
            <div className="flex justify-between">
              <span>{t("dashboard.total_slabs")}:</span>
              <span className="font-semibold">150</span>
            </div>
            <div className="flex justify-between">
              <span>{t("dashboard.average_yield")}:</span>
              <span className="font-semibold">87%</span>
            </div>
            <div className="flex justify-between">
              <span>{t("dashboard.approved_slabs")}:</span>
              <span className="font-semibold">142</span>
            </div>
          </div>
        </div>

        {/* Common Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Common Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {t("common.save")}
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              {t("common.delete")}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {t("common.add")}
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              {t("common.edit")}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {t("common.search")}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              {t("common.cancel")}
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t("blocks.title")}
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("blocks.stone_type")}
              </label>
              <input
                type="text"
                placeholder={t("blocks.stone_type_placeholder")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  {t("blocks.length")}
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  {t("blocks.width")}
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  {t("blocks.height")}
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200/60">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🎯 How to Test Telugu Translation:
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>
            Click the <strong>🇮🇳 తెలుగు</strong> button above to switch to
            Telugu
          </li>
          <li>Or use the language switcher in the top navigation bar</li>
          <li>All text will instantly translate to Telugu</li>
          <li>Navigate to different pages to see full translation coverage</li>
          <li>Your language preference is automatically saved</li>
        </ol>
      </div>
    </div>
  );
}
