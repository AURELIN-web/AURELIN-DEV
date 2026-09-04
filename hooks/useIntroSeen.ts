"use client";

import { useState, useEffect, useCallback } from "react";

export function useIntroSeen(key = "aurelin_intro_seen") {
  const [seen, setSeen] = useState(true); // Default true prevents SSR flash

  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem(key);
      setSeen(hasSeen === "true");
    } catch {
      setSeen(true);
    }
  }, [key]);

  const markSeen = useCallback(() => {
    try {
      sessionStorage.setItem(key, "true");
    } catch {
      // ignore
    }
    setSeen(true);
  }, [key]);

  return { seen, markSeen };
}
