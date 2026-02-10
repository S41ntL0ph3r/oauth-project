"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type NavItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

const NavContainer = () => {
  const router = useRouter();

  const items: NavItem[] = [
    { label: "Home", href: "/home" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Orçamento", href: "/budget" },
    { label: "Relatórios", href: "/relatorios" },
    { label: "Notificações", href: "/notificacoes" },
    { label: "Profile", href: "/profile" },
    { label: "Settings", href: "/settings" },
    { label: "Analytics", href: "/analytics" },
    { label: "Security", href: "/security" },
    { label: "Backups", href: "/backups" },
    { label: "Reports", href: "/reports" },
    {
      label: "Logout",
      onClick: async () => {
        await signOut({ redirect: false });
        router.push("/sign-in");
      },
    },
  ];

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-gray-900 dark:text-white">
          Meu App
        </Link>

        <nav className="flex items-center gap-6">
          {items.map((it) =>
            it.href ? (
              <Link key={it.label} href={it.href} className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                {it.label}
              </Link>
            ) : (
              <button
                key={it.label}
                onClick={it.onClick}
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {it.label}
              </button>
            )
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavContainer;
