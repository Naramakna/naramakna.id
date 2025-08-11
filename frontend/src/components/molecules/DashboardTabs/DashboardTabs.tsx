import React from 'react';

interface TabItem {
  id: string;
  name: string;
  count?: number | string;
}

interface DashboardTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'admin' | 'superadmin';
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'admin'
}) => {
  const colorScheme = variant === 'superadmin' ? 'red' : 'blue';

  return (
    <div className="px-4 sm:px-6">
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:space-x-6 xl:space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === tab.id
                ? `border-${colorScheme}-500 text-${colorScheme}-600`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="truncate max-w-xs">{tab.name}</span>
            {tab.count !== undefined && (
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === tab.id
                  ? `bg-${colorScheme}-100 text-${colorScheme}-600`
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Mobile/Tablet Navigation - Horizontal Scroll */}
      <div className="lg:hidden">
        <nav className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? `border-${colorScheme}-500 text-${colorScheme}-600`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="truncate max-w-[120px]">{tab.name}</span>
              {tab.count !== undefined && (
                <span className={`ml-1 py-0.5 px-1.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? `bg-${colorScheme}-100 text-${colorScheme}-600`
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Grid Layout for Extra Small Screens */}
      <div className="sm:hidden">
        <div className="grid grid-cols-2 gap-2 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`p-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? `bg-${colorScheme}-50 border-2 border-${colorScheme}-200 text-${colorScheme}-700`
                  : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-sm truncate">{tab.name}</div>
              {tab.count !== undefined && (
                <div className={`text-xs mt-1 ${
                  activeTab === tab.id ? `text-${colorScheme}-600` : 'text-gray-500'
                }`}>
                  {tab.count} items
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
