import React from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={twMerge("bg-white rounded-lg shadow-md p-4", className)}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  children,
}) => {
  return (
    <div className={twMerge("pb-3 mb-3 border-b border-gray-200", className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  className,
  children,
}) => {
  return (
    <h3 className={twMerge("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  className,
  children,
}) => {
  return <div className={twMerge("", className)}>{children}</div>;
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  children,
}) => {
  return (
    <div className={twMerge("pt-3 mt-3 border-t border-gray-200", className)}>
      {children}
    </div>
  );
};
