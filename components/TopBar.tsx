"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  onMobileMenuToggle?: () => void;
  showMobileMenu?: boolean;
}

export default function TopBar({
  onMobileMenuToggle,
  showMobileMenu,
}: TopBarProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "New block inspection completed",
      message: "Block #abc123 has been inspected",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Quality alert",
      message: "3 slabs marked as defective",
      time: "15 min ago",
      unread: true,
    },
    {
      id: 3,
      title: "Yield target achieved",
      message: "Block #def456 exceeded yield expectations",
      time: "1 hour ago",
      unread: false,
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 sm:px-6 py-3 relative z-30 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button + Search Bar */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Hamburger Menu Button (Mobile Only) */}
          {showMobileMenu && (
            <button
              onClick={() => {
                console.log("Hamburger clicked!");
                onMobileMenuToggle?.();
              }}
              className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-200 lg:hidden relative z-50 group"
            >
              <svg
                className="h-5 w-5 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          )}

          {/* Modern Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search blocks, slabs, inspections..."
                className="block w-full pl-11 pr-4 py-2.5 bg-gray-50/80 border-0 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:shadow-sm transition-all duration-200"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-gray-400 bg-white/60 border border-gray-200/60 rounded-md">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Modern Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowAccountMenu(false);
              }}
              className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all duration-200 group"
            >
              <svg
                className="h-5 w-5 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              {notifications.filter((n) => n.unread).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg animate-pulse">
                  {notifications.filter((n) => n.unread).length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/60 z-50 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/60">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                        />
                      </svg>
                      Notifications
                    </h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Mark all read
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100/60 hover:bg-gray-50/80 cursor-pointer transition-all duration-200 ${
                        notification.unread
                          ? "bg-blue-50/50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4
                            className={`text-sm font-medium ${
                              notification.unread
                                ? "text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <svg
                              className="h-3 w-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              />
                            </svg>
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full ml-3 animate-pulse shadow-sm"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all duration-200 group">
            <svg
              className="h-5 w-5 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>

          {/* Modern Account Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAccountMenu(!showAccountMenu);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all duration-200 group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg ring-2 ring-white group-hover:scale-105 transition-transform">
                AZ
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                  Azhar
                </p>
                <p className="text-xs text-gray-500">Factory Manager</p>
              </div>
              <svg
                className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/60 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Azhar</p>
                  <p className="text-xs text-gray-500">
                    azhar@stonefactory.com
                  </p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setShowAccountMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg
                      className="mr-3 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setShowAccountMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg
                      className="mr-3 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      router.push("/support");
                      setShowAccountMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg
                      className="mr-3 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Help & Support
                  </button>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <svg
                      className="mr-3 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
