import React from 'react';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'konten', label: 'Konten' },
    { id: 'komentar', label: 'Komentar' },
    { id: 'suka', label: 'Suka' }
  ];

  return (
    <div className="border-b border-gray-200">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
