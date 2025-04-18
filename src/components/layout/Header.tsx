"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bars3Icon,
  XMarkIcon,
  LanguageIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  CalculatorIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/utils/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { CalculatorModal } from "../ui/CalculatorModal";

export const Header: React.FC<{
  setActiveView?: (view: string) => void;
  activeView?: string;
}> = ({ setActiveView, activeView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "te" : "en");
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const toggleCalculator = () => {
    setIsCalculatorOpen(!isCalculatorOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleViewChange = (view: string) => {
    if (setActiveView) {
      setActiveView(view);
      if (isMenuOpen) setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <BuildingStorefrontIcon className="h-8 w-8 mr-2 text-yellow-300" />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-wide leading-none text-yellow-300">
                  {t("brand.name")}
                </span>
                <span className="text-xs font-medium text-yellow-100 opacity-80">
                  {language === "en" ? "Brick Manufacturing" : "ఇటుక తయారీ"}
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <button
              onClick={() => handleViewChange("workers")}
              className={`flex items-center text-white hover:text-indigo-200 px-3 py-2 text-sm font-medium ${
                activeView === "workers" ? "border-b-2 border-white" : ""
              }`}
            >
              <HomeIcon className="h-5 w-5 mr-1" />
              {t("nav.home")}
            </button>
            <button
              onClick={() => handleViewChange("brickLoads")}
              className={`flex items-center text-white hover:text-indigo-200 px-3 py-2 text-sm font-medium ${
                activeView === "brickLoads" ? "border-b-2 border-white" : ""
              }`}
            >
              <TruckIcon className="h-5 w-5 mr-1" />
              {t("nav.brickLoads")}
            </button>
            <button
              onClick={toggleCalculator}
              className="flex items-center text-white hover:text-indigo-200 px-3 py-2 text-sm font-medium"
            >
              <CalculatorIcon className="h-5 w-5 mr-1" />
              {t("nav.calculator")}
            </button>
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center text-white hover:text-indigo-200 px-3 py-2 text-sm font-medium"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                {t("auth.signOut") || "Sign Out"}
              </button>
            )}
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center rounded-full bg-indigo-700 p-1 text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              <LanguageIcon className="h-6 w-6" aria-hidden="true" />
              <span className="ml-1 mr-1">{language.toUpperCase()}</span>
            </button>

            <div className="ml-3 sm:hidden">
              <button
                type="button"
                onClick={toggleMenu}
                className="flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-indigo-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => handleViewChange("workers")}
              className="flex items-center text-white hover:bg-indigo-800 w-full text-left px-3 py-2 rounded-md text-base font-medium"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              {t("nav.home")}
            </button>
            <button
              onClick={() => handleViewChange("brickLoads")}
              className="flex items-center text-white hover:bg-indigo-800 w-full text-left px-3 py-2 rounded-md text-base font-medium"
            >
              <TruckIcon className="h-5 w-5 mr-2" />
              {t("nav.brickLoads")}
            </button>
            <button
              onClick={toggleCalculator}
              className="flex items-center text-white hover:bg-indigo-800 w-full text-left px-3 py-2 rounded-md text-base font-medium"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              {t("nav.calculator")}
            </button>
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center text-white hover:bg-indigo-800 w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                {t("auth.signOut") || "Sign Out"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </header>
  );
};
