"use client";

import React, { useState } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { useLanguage } from "@/utils/i18n";
import { twMerge } from "tailwind-merge";

export const Calculator: React.FC = () => {
  const { language } = useLanguage();
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [evaluated, setEvaluated] = useState<boolean>(false);

  const handleNumberClick = (value: string) => {
    if (evaluated) {
      setInput(value);
      setEvaluated(false);
    } else {
      setInput((prev) => prev + value);
    }
  };

  const handleOperatorClick = (operator: string) => {
    if (input === "" && operator === "-") {
      setInput("-");
      return;
    }

    if (input !== "") {
      const lastChar = input.slice(-1);
      if (["+", "-", "×", "÷", "%"].includes(lastChar)) {
        setInput((prev) => prev.slice(0, -1) + operator);
      } else {
        setInput((prev) => prev + operator);
      }
      setEvaluated(false);
    }
  };

  const handleClear = () => {
    setInput("");
    setResult("");
    setEvaluated(false);
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    try {
      if (input) {
        // Replace operators with their JavaScript equivalents
        let expression = input.replace(/×/g, "*").replace(/÷/g, "/");

        // Handle percentage calculations
        if (expression.includes("%")) {
          expression = expression.replace(/(\d+\.?\d*)%/g, (match, number) => {
            return String(parseFloat(number) / 100);
          });
        }

        const calculatedResult = eval(expression);
        setResult(calculatedResult.toString());
        setInput(calculatedResult.toString());
        setEvaluated(true);
      }
    } catch (error) {
      setResult("Error");
      setEvaluated(true);
    }
  };

  // Button styles
  const buttonStyle =
    "w-12 h-12 md:w-14 md:h-14 m-1 rounded-full text-lg font-medium flex items-center justify-center shadow-md active:shadow-sm transform active:scale-95 transition-transform";
  const numberStyle = "bg-white text-gray-800 hover:bg-gray-50";
  const operatorStyle = "bg-amber-500 text-white hover:bg-amber-600";
  const actionStyle = "bg-gray-200 text-gray-700 hover:bg-gray-300";
  const equalStyle = "bg-red-500 text-white hover:bg-red-600";

  return (
    <Card className="max-w-sm mx-auto p-4 bg-gradient-to-b from-indigo-50 to-slate-100 shadow-lg">
      <div className="bg-white p-4 rounded-lg mb-4 text-right shadow-inner">
        <div className="text-sm text-indigo-600 min-h-6">
          {result && !evaluated && (
            <div className="text-right">{result && `(${result})`}</div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-800 h-10 overflow-auto">
          {input || "0"}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1">
        <button
          className={twMerge(buttonStyle, actionStyle)}
          onClick={handleClear}
        >
          {language === "en" ? "AC" : "AC"}
        </button>
        <button
          className={twMerge(buttonStyle, actionStyle)}
          onClick={() => handleOperatorClick("%")}
        >
          %
        </button>
        <button
          className={twMerge(buttonStyle, actionStyle)}
          onClick={() => handleOperatorClick("(")}
        >
          (
        </button>
        <button
          className={twMerge(buttonStyle, actionStyle)}
          onClick={() => handleOperatorClick(")")}
        >
          )
        </button>

        <button
          className={twMerge(buttonStyle, numberStyle)}
          onClick={() => handleNumberClick("7")}
        >
          7
        </button>
        <button
          className={twMerge(buttonStyle, numberStyle)}
          onClick={() => handleNumberClick("8")}
        >
          8
        </button>
        <button
          className={twMerge(buttonStyle, numberStyle)}
          onClick={() => handleNumberClick("9")}
        >
          9
        </button>
        <button
          className={twMerge(buttonStyle, operatorStyle)}
          onClick={() => handleOperatorClick("÷")}
        >
          ÷
        </button>

        <button
          className={twMerge(buttonStyle, numberStyle)}
          onClick={() => handleNumberClick("4")}
        >
          4
        </button>
        <button
          className={twMerge(buttonStyle, numberStyle)}
          onClick={() => handleNumberClick("5")}
        >
          5
        </button>
        <button
          className={twMerge(buttonStyle, numberStyle)}
          onClick={() => handleNumberClick("6")}
        >
          6
        </button>
        <button
          className={twMerge(buttonStyle, operatorStyle)}
          onClick={() => handleOperatorClick("×")}
        >
          ×
        </button>

        <button
          className={twMerge(buttonStyle, numberStyle)}
          onClick={() => handleNumberClick("1")}
        >
          1
        </button>
        <button
          className={twMerge(buttonStyle, numberStyle)}
          onClick={() => handleNumberClick("2")}
        >
          2
        </button>
        <button
          className={twMerge(buttonStyle, numberStyle)}
          onClick={() => handleNumberClick("3")}
        >
          3
        </button>
        <button
          className={twMerge(buttonStyle, operatorStyle)}
          onClick={() => handleOperatorClick("-")}
        >
          -
        </button>

        <button
          className={twMerge(buttonStyle, numberStyle)}
          onClick={() => handleNumberClick("0")}
        >
          0
        </button>
        <button
          className={twMerge(buttonStyle, numberStyle)}
          onClick={() => handleNumberClick(".")}
        >
          .
        </button>
        <button
          className={twMerge(buttonStyle, numberStyle)}
          onClick={handleBackspace}
        >
          ⌫
        </button>
        <button
          className={twMerge(buttonStyle, operatorStyle)}
          onClick={() => handleOperatorClick("+")}
        >
          +
        </button>

        <button
          className={twMerge(buttonStyle, equalStyle, "col-span-4")}
          onClick={handleCalculate}
        >
          =
        </button>
      </div>
    </Card>
  );
};
