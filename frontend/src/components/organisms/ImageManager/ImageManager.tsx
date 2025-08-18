import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../../config/api';

interface ImagePattern {
  name: string;
  pattern: string;
  count: number;
  samples: string;
}

interface TableAnalysis {
  total: number;
  needsUpdate: number;
  patterns: Record<string, { count: number; samples: string }>;
  error?: string;
}

interface AnalysisData {
  posts: TableAnalysis;
  postmeta: TableAnalysis;
  users: TableAnalysis;
  tiktok_videos: TableAnalysis;
}

interface UpdateResult {
  results: Record<string, { updated: number; found?: number; error?: string }>;
  dryRun: boolean;
  timestamp: string;
  updatedBy: string;
}

const ImageManager: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>(['posts', 'postmeta']);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [customUrl, setCustomUrl] = useState('');
  const [lastUpdate, setLastUpdate] = useState<UpdateResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const tableOptions = [
    { value: 'posts', label: 'Posts Content', description: 'Article content with embedded images' },
    { value: 'postmeta', label: 'Post Metadata', description: 'Thumbnails and attachment URLs' },
    { value: 'users', label: 'User Profiles', description: 'User profile images' },
    { value: 'tiktok_videos', label: 'TikTok Videos', description: 'TikTok cover images (if table exists)' }
  ];

  const commonPatterns = [
    { value: 'localhost:3001/uploads/', label: 'localhost:3001/uploads/' },
    { value: 'localhost:5173/uploads/', label: 'localhost:5173/uploads/' },
    { value: 'localhost:5000/uploads/', label: 'localhost:5000/uploads/' },
    { value: '.ngrok.app/uploads/', label: 'Ngrok App URLs' },
    { value: '.ngrok.io/uploads/', label: 'Ngrok IO URLs' }
  ];

  useEffect(() => {
    // Set default custom URL - use hardcoded production URL since we can't access backend env from frontend
    setCustomUrl('https://benarmak.naramakna.id/uploads');
  }, []);

  const analyzeImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl('image-manager/analysis'), {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to analyze images');

      const data = await response.json();
      setAnalysis(data.data.analysis);

      // Auto-select patterns that have issues
      const patternsWithIssues: string[] = [];
      Object.values(data.data.analysis).forEach((tableData: any) => {
        if (tableData.patterns) {
          Object.keys(tableData.patterns).forEach(pattern => {
            const matchingPattern = commonPatterns.find(p => 
              pattern.includes(p.value.replace('/uploads/', ''))
            );
            if (matchingPattern && !patternsWithIssues.includes(matchingPattern.value)) {
              patternsWithIssues.push(matchingPattern.value);
            }
          });
        }
      });
      setSelectedPatterns(patternsWithIssues);

    } catch (error) {
      console.error('Error analyzing images:', error);
      alert('Error analyzing image URLs. Please try again.');
    }
    setLoading(false);
  };

  const updateImages = async (dryRun = false) => {
    if (selectedTables.length === 0) {
      alert('Please select at least one table to update');
      return;
    }
    
    if (selectedPatterns.length === 0) {
      alert('Please select at least one pattern to replace');
      return;
    }

    if (!customUrl.trim()) {
      alert('Please enter the new base URL');
      return;
    }

    const confirmMessage = dryRun 
      ? 'Run analysis to see what would be updated?' 
      : `This will update ${selectedTables.length} table(s) and replace ${selectedPatterns.length} pattern(s). Are you sure?`;

    if (!confirm(confirmMessage)) return;

    setUpdating(true);
    try {
      const response = await fetch(buildApiUrl('image-manager/update'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tables: selectedTables,
          patterns: selectedPatterns,
          newBaseUrl: customUrl,
          dryRun
        })
      });

      if (!response.ok) throw new Error('Failed to update images');

      const data = await response.json();
      setLastUpdate(data.data);

      if (dryRun) {
        alert(`Dry run completed. Check results below.`);
      } else {
        alert(`✅ Image URLs updated successfully! Updated: ${JSON.stringify(data.data.results)}`);
        // Refresh analysis after update
        setTimeout(analyzeImages, 1000);
      }

    } catch (error) {
      console.error('Error updating images:', error);
      alert('Error updating image URLs. Please try again.');
    }
    setUpdating(false);
  };

  const handleTableToggle = (table: string) => {
    setSelectedTables(prev => 
      prev.includes(table) 
        ? prev.filter(t => t !== table)
        : [...prev, table]
    );
  };

  const handlePatternToggle = (pattern: string) => {
    setSelectedPatterns(prev => 
      prev.includes(pattern)
        ? prev.filter(p => p !== pattern)
        : [...prev, pattern]
    );
  };

  const getTotalIssues = () => {
    if (!analysis) return 0;
    return Object.values(analysis).reduce((total, table) => total + (table.needsUpdate || 0), 0);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Image URL Manager</h2>
          <p className="text-gray-600">Update image URLs across different database tables</p>
        </div>
        <button
          onClick={analyzeImages}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '🔍 Analyzing...' : '🔍 Analyze URLs'}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            📊 Analysis Results - {getTotalIssues()} URLs need updating
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {Object.entries(analysis).map(([tableName, data]) => (
              <div key={tableName} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 capitalize">{tableName.replace('_', ' ')}</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <div>Total records: {data.total}</div>
                  <div className={`font-medium ${data.needsUpdate > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    Needs update: {data.needsUpdate || 0}
                  </div>
                  {data.error && (
                    <div className="text-red-600 text-xs mt-1">{data.error}</div>
                  )}
                </div>
                
                {data.patterns && Object.keys(data.patterns).length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">Issues found:</div>
                    {Object.entries(data.patterns).map(([pattern, info]) => (
                      <div key={pattern} className="text-xs text-gray-700">
                        • {pattern}: {info.count} items
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">🛠️ Update Configuration</h3>

        {/* Table Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Tables to Update:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tableOptions.map(option => (
              <label key={option.value} className="flex items-start">
                <input
                  type="checkbox"
                  checked={selectedTables.includes(option.value)}
                  onChange={() => handleTableToggle(option.value)}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                  {analysis && analysis[option.value as keyof AnalysisData] && (
                    <div className="text-xs text-orange-600">
                      {analysis[option.value as keyof AnalysisData].needsUpdate || 0} items need updating
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Pattern Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Patterns to Replace:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonPatterns.map(pattern => (
              <label key={pattern.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPatterns.includes(pattern.value)}
                  onChange={() => handlePatternToggle(pattern.value)}
                  className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-900 font-mono">{pattern.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* New URL Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Base URL:
          </label>
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://benarmak.naramakna.id/uploads"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            All selected patterns will be replaced with this URL + "/"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => updateImages(true)}
            disabled={updating || selectedTables.length === 0 || selectedPatterns.length === 0}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
          >
            {updating ? '🧪 Testing...' : '🧪 Dry Run (Test Only)'}
          </button>
          
          <button
            onClick={() => updateImages(false)}
            disabled={updating || selectedTables.length === 0 || selectedPatterns.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {updating ? '⚡ Updating...' : '⚡ Update URLs (Live)'}
          </button>
        </div>
      </div>

      {/* Last Update Results */}
      {lastUpdate && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            {lastUpdate.dryRun ? '🧪 Dry Run Results' : '✅ Update Results'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(lastUpdate.results).map(([table, result]) => (
              <div key={table} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 capitalize">{table.replace('_', ' ')}</h4>
                <div className="mt-2 text-sm">
                  {result.error ? (
                    <div className="text-red-600">{result.error}</div>
                  ) : (
                    <div className="text-green-600">
                      Updated: {result.updated}
                      {result.found !== undefined && ` / ${result.found}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            {lastUpdate.dryRun ? 'Dry run' : 'Updated'} by {lastUpdate.updatedBy} at {new Date(lastUpdate.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Always run <strong>Dry Run</strong> first to see what will be updated</li>
          <li>• <strong>Posts</strong>: Updates image URLs in article content</li>
          <li>• <strong>Postmeta</strong>: Updates featured images and thumbnails</li>
          <li>• <strong>Users</strong>: Updates profile images</li>
          <li>• <strong>TikTok Videos</strong>: Updates cover images (if using local images)</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageManager;