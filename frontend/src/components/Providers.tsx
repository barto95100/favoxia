"use client";

import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeLoader } from "./ThemeLoader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <ThemeLoader />
      {children}
    </NotificationProvider>
  );
}
