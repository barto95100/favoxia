"use client";

import { useEffect } from "react";
import { loadTheme } from "@/lib/themes";

export function ThemeLoader() {
  useEffect(() => {
    // Charger le thème sauvegardé
    loadTheme();
  }, []);

  return null;
}
