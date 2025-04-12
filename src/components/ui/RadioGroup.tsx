import React from "react";
import { twMerge } from "tailwind-merge";

export interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  error?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  name,
  value,
  onChange,
  label,
  error,
  className,
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className={twMerge(
                "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500",
                error ? "border-red-500" : ""
              )}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className="ml-3 block text-sm font-medium text-gray-900"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
