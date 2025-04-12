import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTab,
  onChange,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <div className={twMerge("border-b border-gray-200", className)}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={twMerge(
              "px-4 py-2 text-sm font-medium whitespace-nowrap",
              activeTab === item.id
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

interface TabPanelsProps {
  activeTab: string;
  children: React.ReactNode;
}

interface TabPanelElement extends React.ReactElement {
  props: {
    id: string;
    children: React.ReactNode;
  };
}

export const TabPanels: React.FC<TabPanelsProps> = ({
  activeTab,
  children,
}) => {
  // Filter and render only the active children (TabPanel)
  const childrenArray = React.Children.toArray(children);
  const activeChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) &&
      (child as TabPanelElement).props.id === activeTab
  );

  return <div className="mt-4">{activeChild}</div>;
};

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({ children }) => {
  return <div>{children}</div>;
};
