import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { SessionProvider } from "../components/session-provider";
import { ThemeProvider } from "../contexts/theme-context";
import { auth } from "@/lib/auth";
import ServiceWorkerProvider from "../components/service-worker-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OAuth App",
  description: "Login and authentication demo",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <SessionProvider session={session}>
            <ServiceWorkerProvider>
              {children}
            </ServiceWorkerProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
