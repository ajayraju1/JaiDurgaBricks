import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={twMerge(
              "h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500",
              error ? "border-red-500" : "",
              className
            )}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-900">{label}</label>
            {error && <p className="text-red-600">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
