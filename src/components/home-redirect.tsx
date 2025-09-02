"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirects to /home after 5 seconds, but only on first visit (stores flag in sessionStorage)
export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      const visited = sessionStorage.getItem("visitedHome");
      if (!visited) {
        const t = setTimeout(() => {
          sessionStorage.setItem("visitedHome", "1");
          router.push("/home");
        }, 5000);
        return () => clearTimeout(t);
      }
    } catch {
      // sessionStorage may be unavailable; still redirect after timeout
      const t = setTimeout(() => router.push("/home"), 5000);
      return () => clearTimeout(t);
    }
  }, [router]);

  return null;
}
