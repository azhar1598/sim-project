"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile/tablet
  useEffect(() => {
    const checkScreenSize = () => {
      const newIsMobile = window.innerWidth < 1024; // lg breakpoint
      console.log("Screen width:", window.innerWidth, "isMobile:", newIsMobile);
      setIsMobile(newIsMobile);
      if (newIsMobile) {
        setMobileMenuOpen(false); // Close mobile menu on resize
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Map pathnames to sidebar tab IDs
  const getActiveTab = (path: string) => {
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path === "/blocks") return "blocks";
    if (path === "/slabs") return "slabs";
    if (path === "/inventory") return "inventory";
    if (path === "/analytics") return "analytics";
    if (path === "/settings") return "settings";
    if (path === "/support") return "support";
    return "dashboard";
  };

  const activeTab = getActiveTab(pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile unless menu is open */}
      <div
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 ${
                mobileMenuOpen
                  ? "translate-x-0 pointer-events-auto"
                  : "-translate-x-full pointer-events-none"
              }`
            : ""
        } transition-transform duration-300 ease-in-out`}
      >
        <Sidebar
          activeTab={activeTab}
          onCollapse={setSidebarCollapsed}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content Area with Top Bar */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Top Navigation Bar with Hamburger */}
        <TopBar
          onMobileMenuToggle={() => {
            console.log(
              "Toggle called! Current state:",
              mobileMenuOpen,
              "New state:",
              !mobileMenuOpen
            );
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          showMobileMenu={isMobile}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
