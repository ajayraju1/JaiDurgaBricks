"use client";

import React, { useState } from "react";
import { Header } from "./Header";
import { useLanguage } from "@/utils/i18n";
import BrickLoadDetail from "@/components/brickloads/BrickLoadDetail";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<string>("workers");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeView === "workers" ? children : <BrickLoadDetail />}
      </main>
      <footer className="bg-gray-800 text-white py-4 text-center text-sm">
        © {new Date().getFullYear()} {t("brand.name")} - {t("brand.shortName")}
      </footer>
    </div>
  );
};
