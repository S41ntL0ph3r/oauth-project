"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const v = localStorage.getItem("cookie_consent");
    setAccepted(v === "1");
  }, []);

  if (accepted) return null;

  const onAccept = () => {
    localStorage.setItem("cookie_consent", "1");
    setAccepted(true);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-md px-4 py-3 flex items-center gap-4">
      <div className="text-sm">Este site usa cookies para melhorar a experiência. Aceita?</div>
      <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={onAccept}>Aceitar</button>
    </div>
  );
}
