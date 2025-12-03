import { useState, useEffect } from 'react';
import { youtubeAPI, type YouTubeVideo } from '../services/api/youtube';

interface UseYouTubeVideosResult {
  videos: YouTubeVideo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useYouTubeVideos = (autoFetch: boolean = true): UseYouTubeVideosResult => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    if (!autoFetch) return;

    try {
      setLoading(true);
      setError(null);

      const response = await youtubeAPI.getVideos();

      if (response.success) {
        // Filter only published videos and sort by newest first
        const publishedVideos = response.data
          .filter(video => video.status === 'published')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setVideos(publishedVideos);
      } else {
        setError(response.message || 'Failed to fetch YouTube videos');
        setVideos([]);
      }
    } catch (err) {
      console.error('Error fetching YouTube videos:', err);
      setError('Network error while fetching YouTube videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [autoFetch]);

  return {
    videos,
    loading,
    error,
    refetch: fetchVideos
  };
};

// Hook for getting a single YouTube video by ID
export const useYouTubeVideo = (id: number | null) => {
  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await youtubeAPI.getVideoById(id);

        if (response.success) {
          setVideo(response.data);
        } else {
          setError(response.message || 'Failed to fetch YouTube video');
          setVideo(null);
        }
      } catch (err) {
        console.error('Error fetching YouTube video:', err);
        setError('Network error while fetching YouTube video');
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  return {
    video,
    loading,
    error
  };
};