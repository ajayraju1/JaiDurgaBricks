"use client";

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";
import { Calculator } from "./Calculator";
import { useLanguage } from "@/utils/i18n";

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-indigo-600/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-indigo-900">
            {t("calculator.title")}
          </h2>
          <Button variant="ghost" className="p-1" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
        <Calculator />
      </div>
    </div>
  );
};
