"use client"
import React from "react";

export interface TabDefinition<TId extends string = string> {
  id: TId;
  label: string;
  badgeCount?: number;
}

interface TabManagerProps<TId extends string = string> {
  tabs: TabDefinition<TId>[];
  activeTab: TId;
  onChange: (id: TId) => void;
  className?: string;
}

export default function TabManager<TId extends string = string>({
  tabs,
  activeTab,
  onChange,
  className,
}: TabManagerProps<TId>) {
  return (
    <div className={className}>
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.badgeCount === "number" && (
                <span className="ml-1">({tab.badgeCount})</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}


