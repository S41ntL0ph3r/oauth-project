"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

/**
 * ProtectedLayoutClient Component
 * 
 * Componente client-side que gerencia o estado da sidebar
 * e coordena a navegação entre Navbar e Sidebar
 */

interface ProtectedLayoutClientProps {
  children: React.ReactNode;
}

export default function ProtectedLayoutClient({
  children,
}: ProtectedLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header fixo */}
      <Navbar onToggleSidebar={toggleSidebar} />

      {/* Sidebar recolhível */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Conteúdo principal com padding-top para compensar header fixo */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
