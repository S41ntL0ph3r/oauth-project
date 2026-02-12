"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

/**
 * Navbar Component
 * 
 * Header limpo e profissional com apenas opções essenciais:
 * - Home, Dashboard, Profile, Settings, Logout
 * - Botão para toggle da sidebar
 * - Design corporativo e responsivo
 */

type NavItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  mobileHidden?: boolean;
};

interface NavContainerProps {
  onToggleSidebar: () => void;
}

const NavContainer = ({ onToggleSidebar }: NavContainerProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const items: NavItem[] = [
    { label: "Home", href: "/home" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile", mobileHidden: true },
    { label: "Settings", href: "/settings", mobileHidden: true },
    {
      label: "Logout",
      onClick: async () => {
        await signOut({ redirect: false });
        router.push("/sign-in");
      },
    },
  ];

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo e Menu Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Abrir menu de navegação"
            aria-expanded="false"
          >
            <svg
              className="w-6 h-6 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link 
            href="/" 
            className="font-bold text-xl text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
          >
            Gestão Financeira
          </Link>
        </div>

        {/* Navegação principal */}
        <nav 
          className="flex items-center gap-1 lg:gap-2"
          role="navigation"
          aria-label="Navegação principal do cabeçalho"
        >
          {items.map((item) => {
            const isActive = item.href && pathname === item.href;
            
            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${item.mobileHidden ? "hidden sm:block" : ""}
                    ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default NavContainer;
