import React from 'react';
import { PollingItem } from '../../atoms/PollingItem/PollingItem';
import { usePolling } from '../../../hooks/usePolling';

export const PollingGallery: React.FC = () => {
  const { polls, loading, error } = usePolling(8); // Load 8 polls

  // Transform polls data to match PollingData interface
  const transformedPolls = polls.map(poll => {
    return {
      id: poll.id.toString(),
      question: poll.question || poll.title,
      options: poll.options?.map(opt => opt.text) || [],
      totalVotes: poll.totalVotes || 0,
      endDate: new Date(Date.now() + (poll.daysLeft || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: poll.source || 'GENERAL',
      isActive: true,
      image_url: poll.image_url || null
    };
  });

  return (
    <div className="w-full">
      {/* Error Message */}
      {error && (
        <div className="text-center mb-4">
          <p className="text-red-500 text-sm">Error loading polls: {error}</p>
        </div>
      )}

      {/* Polling Grid - 4 kolom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {transformedPolls.length > 0 ? (
          transformedPolls.map((polling) => (
            <div key={polling.id} className="flex-shrink-0">
              <PollingItem
                id={polling.id}
                question={polling.question}
                options={polling.options}
                totalVotes={polling.totalVotes}
                endDate={polling.endDate}
                category={polling.category}
                isActive={polling.isActive}
                image_url={polling.image_url}
              />
            </div>
          ))
        ) : !loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No polls available at the moment</p>
          </div>
        ) : null}
      </div>
      
      {/* Loading Animation */}
      {loading && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <span className="text-gray-600 text-sm">Memuat polling...</span>
          </div>
        </div>
      )}
    </div>
  );
};
