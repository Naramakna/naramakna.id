import { useState, useEffect, useCallback } from 'react';
import { pollingAPI } from '../services/api/polling';
import type { Poll, VoteRequest } from '../services/api/polling';

interface UsePollingReturn {
  polls: Poll[];
  loading: boolean;
  error: string | null;
  vote: (voteData: VoteRequest) => Promise<boolean>;
  refreshPolls: () => Promise<void>;
}

export const usePolling = (limit: number = 10): UsePollingReturn => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await pollingAPI.getActivePolls({ limit });
      
      if (response.success) {
        setPolls(response.data?.polls || []);
      } else {
        setError(response.message || 'Failed to fetch polls');
        setPolls([]); // Ensure polls is always an array
      }
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError('Network error while fetching polls');
      setPolls([]); // Ensure polls is always an array even on error
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const vote = useCallback(async (voteData: VoteRequest): Promise<boolean> => {
    try {
      // Add browser fingerprint for vote tracking (NO LOGIN REQUIRED)
      const browserFingerprint = localStorage.getItem('browser_fingerprint') || 
        `browser_${navigator.userAgent.slice(0, 20)}_${Date.now()}`;
      localStorage.setItem('browser_fingerprint', browserFingerprint);
      
      const response = await pollingAPI.vote({
        ...voteData,
        user_id: browserFingerprint
      });
      
      if (response.success) {
        // Store vote in localStorage to prevent UI re-voting
        const votedPolls = JSON.parse(localStorage.getItem('voted_polls') || '{}');
        votedPolls[voteData.poll_id] = voteData.option_id;
        localStorage.setItem('voted_polls', JSON.stringify(votedPolls));
        
        // Refresh polls after successful vote to get updated percentages
        await fetchPolls();
        return true;
      } else {
        setError(response.message || 'Failed to record vote');
        return false;
      }
    } catch (err: any) {
      console.error('Error voting:', err);
      if (err.message.includes('409') || err.message.includes('already voted')) {
        setError('You have already voted for this poll');
      } else {
        setError('Network error while voting');
      }
      return false;
    }
  }, [fetchPolls]);

  const refreshPolls = useCallback(async () => {
    await fetchPolls();
  }, [fetchPolls]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  return {
    polls,
    loading,
    error,
    vote,
    refreshPolls
  };
};
