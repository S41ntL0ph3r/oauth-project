"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

/**
 * Sidebar Component
 * 
 * Navegação lateral recolhível com animação "envelope"
 * - Desktop: Sidebar fixa e recolhível
 * - Mobile: Sidebar em modo overlay
 * - Acessibilidade completa com ARIA e navegação por teclado
 */

type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  description?: string;
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Detectar viewport mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevenir scroll do body quando sidebar está aberta no mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isOpen]);

  // Fechar sidebar com tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const sidebarItems: SidebarItem[] = [
    {
      label: "Orçamento",
      href: "/budget",
      icon: "💰",
      description: "Planejamento mensal",
    },
    {
      label: "Relatórios",
      href: "/relatorios",
      icon: "📊",
      description: "Relatórios personalizados",
    },
    {
      label: "Notificações",
      href: "/notificacoes",
      icon: "🔔",
      description: "Alertas e avisos",
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: "📈",
      description: "Análise de dados",
    },
    {
      label: "Security",
      href: "/security",
      icon: "🔒",
      description: "Segurança",
    },
    {
      label: "Backups",
      href: "/backups",
      icon: "💾",
      description: "Backup de dados",
    },
    {
      label: "Reports",
      href: "/reports",
      icon: "📄",
      description: "Relatórios do sistema",
    },
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 bottom-0 left-0 z-50
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isMobile ? "w-72" : "w-64"}
          shadow-lg
        `}
        role="navigation"
        aria-label="Navegação principal"
        aria-hidden={!isOpen}
      >
        {/* Header da sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Fechar menu"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Lista de navegação */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && onClose()}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-2xl" aria-hidden="true">
                  {item.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer da sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>© 2026 Gestão Financeira</p>
          </div>
        </div>
      </aside>
    </>
  );
}
