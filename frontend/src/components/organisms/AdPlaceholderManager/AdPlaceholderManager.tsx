import React from 'react';
import { Button } from '../../atoms/Button';

interface AdPlaceholderManagerProps {
  placeholderSettings: {[key: string]: boolean};
  globalPlaceholder: boolean;
  savingSettings: boolean;
  onTogglePlacement: (placement: string) => void;
  onToggleGlobal: () => void;
  onSaveSettings: () => Promise<void>;
}

export const AdPlaceholderManager: React.FC<AdPlaceholderManagerProps> = ({
  placeholderSettings,
  globalPlaceholder,
  savingSettings,
  onTogglePlacement,
  onToggleGlobal,
  onSaveSettings
}) => {
  
  // Get placement description
  const getPlacementDescription = (placement: string) => {
    const descriptions: { [key: string]: string } = {
      'hero-banner': '🏠 Homepage Banner (970x250)',
      'header': '📄 Header Banner (970x250)', 
      'mid-content': '🏠 Homepage Mid Section',
      'bottom-content': '🏠 Homepage Bottom',
      'popup': '🎯 Homepage Popup (Fullscreen)',
      'regular': '📝 Content Pages (728x90)',
      'sidebar': '📱 Sidebar Ads (300x250)',
      'article-top': '📰 Article Page Top',
      'article-mid': '📰 Article Page Middle',
      'article-bottom': '📰 Article Page Bottom',
      'article-final': '📰 Article Page End',
      'content-ad': '📰 In-Content Ads',
      'breaking-pre': '⚡ Before Breaking News',
      'breaking-post': '⚡ After Breaking News'
    };
    return descriptions[placement] || `📍 ${placement}`;
  };

  const getPlacementUrls = (placement: string) => {
    const urlExamples: { [key: string]: string[] } = {
      'hero-banner': ['https://naramakna.id/ (homepage banner)'],
      'header': ['https://naramakna.id/ (header banner)'],
      'mid-content': ['https://naramakna.id/ (mid section)'],
      'bottom-content': ['https://naramakna.id/ (bottom section)'],
      'popup': ['https://naramakna.id/ (popup overlay)'],
      'regular': [
        'https://naramakna.id/video-story',
        'https://naramakna.id/index-berita',
        'https://naramakna.id/polling'
      ],
      'sidebar': [
        'https://naramakna.id/artikel/... (sidebar)',
        'https://naramakna.id/index-berita (sidebar)'
      ],
      'article-top': ['https://naramakna.id/artikel/... (top of article)'],
      'article-mid': ['https://naramakna.id/artikel/... (middle of article)'],
      'article-bottom': ['https://naramakna.id/artikel/... (bottom of article)'],
      'article-final': ['https://naramakna.id/artikel/... (end of article)'],
      'content-ad': ['https://naramakna.id/artikel/... (within content)'],
      'breaking-pre': ['Before breaking news sections'],
      'breaking-post': ['After breaking news sections']
    };
    return urlExamples[placement] || [`${placement} placement`];
  };

  const visibleCount = Object.values(placeholderSettings).filter(Boolean).length;
  const totalCount = Object.keys(placeholderSettings).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">👁️ Ad Placeholder Visibility Manager</h2>
        <p className="text-gray-600 mt-2">
          Control which ad placeholders are shown when no real ads are available. 
          This helps create a cleaner look during development or when ads are not yet ready.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{visibleCount}/{totalCount}</div>
          <div className="text-gray-600">Placeholders Visible</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-600">{totalCount - visibleCount}/{totalCount}</div>
          <div className="text-gray-600">Placeholders Hidden</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className={`text-2xl font-bold ${globalPlaceholder ? 'text-green-600' : 'text-red-600'}`}>
            {globalPlaceholder ? '✅ ON' : '❌ OFF'}
          </div>
          <div className="text-gray-600">Global Override</div>
        </div>
      </div>

      {/* Global Toggle */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Global Placeholder Control</h3>
            <p className="text-gray-600 mt-1">
              Master switch to show or hide all ad placeholders across the entire website.
              When OFF, no placeholders will be shown regardless of individual settings.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-6">
            <input
              type="checkbox"
              checked={globalPlaceholder}
              onChange={onToggleGlobal}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-lg font-medium text-gray-900">
              {globalPlaceholder ? '✅ All Visible' : '❌ All Hidden'}
            </span>
          </label>
        </div>
      </div>

      {/* Individual Placement Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Placement Controls</h3>
        <p className="text-gray-600 mb-6">
          Fine-tune visibility for specific ad placements. These settings work when Global Control is ON.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(placeholderSettings).map(([placement, visible]) => (
            <div key={placement} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {getPlacementDescription(placement)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      visible && globalPlaceholder ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {visible && globalPlaceholder ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    <strong>Placement ID:</strong> {placement}
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    <strong>Appears on:</strong>
                    <ul className="mt-1 space-y-1">
                      {getPlacementUrls(placement).map((url, index) => (
                        <li key={index} className="text-blue-600">• {url}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={() => onTogglePlacement(placement)}
                    disabled={!globalPlaceholder}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${
                    !globalPlaceholder ? 'opacity-50 cursor-not-allowed' : ''
                  }`}></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-500 text-lg">💡</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">How Ad Placeholders Work</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>When <strong>placeholders are visible</strong>: Empty gray boxes with "Advertisement Banner" text are shown when no real ads are available</li>
                <li>When <strong>placeholders are hidden</strong>: No content is shown when no real ads are available (cleaner look)</li>
                <li>Global Control overrides all individual settings when turned OFF</li>
                <li>Real ads will always be shown regardless of placeholder settings</li>
                <li>Changes take effect immediately across the website</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={onSaveSettings}
          disabled={savingSettings}
          size="lg"
          variant="primary"
        >
          {savingSettings ? '⏳ Saving Settings...' : '💾 Save Placeholder Settings'}
        </Button>
      </div>
    </div>
  );
};