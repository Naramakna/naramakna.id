import React, { useState } from 'react';
import type { ScheduledPost, ScheduleRequest } from '../../../services/api/scheduler';


// Helper function to format date to local datetime string
const formatLocalDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ScheduledPost | null;
  onSchedule: (postId: number, scheduleData: ScheduleRequest) => Promise<void>;
  onReschedule?: (postId: number, scheduleData: ScheduleRequest) => Promise<void>;
  onCancel?: (postId: number, notes?: string) => Promise<void>;
  isLoading?: boolean;
  mode: 'schedule' | 'reschedule' | 'view';
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  post,
  onSchedule,
  onReschedule,
  onCancel,
  isLoading = false,
  mode = 'schedule'
}) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (post && mode === 'reschedule' && post.scheduled_publish_date) {
      const date = new Date(post.scheduled_publish_date);
      setScheduledDate(formatLocalDateTime(date).split('T')[0]);
      setScheduledTime(formatLocalDateTime(date).split("T")[1]);
    } else {
      // Default to 1 hour from now
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 1);
      setScheduledDate(formatLocalDateTime(defaultDate).split('T')[0]);
      setScheduledTime(formatLocalDateTime(defaultDate).split("T")[1]);
    }
    
    setNotes(post?.scheduling_notes || '');
  }, [post, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setIsSubmitting(true);
    try {
      const scheduledDateTime = `${scheduledDate}T${scheduledTime}:00`;
      const scheduleData: ScheduleRequest = {
        scheduledDate: scheduledDateTime,
        notes: notes.trim() || undefined
      };

      if (mode === 'schedule') {
        await onSchedule(post.ID, scheduleData);
      } else if (mode === 'reschedule' && onReschedule) {
        await onReschedule(post.ID, scheduleData);
      }

      onClose();
    } catch (error) {
      console.error('Error handling schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!post || !onCancel) return;

    setIsSubmitting(true);
    try {
      await onCancel(post.ID, notes.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Error cancelling schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !post) return null;

  const minDateTime = new Date();
  minDateTime.setMinutes(minDateTime.getMinutes() + 5); // Minimum 5 minutes from now
  const minDate = formatLocalDateTime(minDateTime).split('T')[0];
  const minTime = formatLocalDateTime(minDateTime).split("T")[1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'schedule' && 'Schedule Post'}
            {mode === 'reschedule' && 'Reschedule Post'}
            {mode === 'view' && 'Schedule Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Post Title</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            {post.post_title}
          </p>
        </div>

        {mode === 'view' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date & Time
              </label>
              <p className="text-sm text-gray-900">
                {post.scheduled_publish_date 
                  ? new Date(post.scheduled_publish_date).toLocaleString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Not scheduled'
                }
              </p>
            </div>
            
            {post.scheduling_notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {post.scheduling_notes}
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              {onReschedule && (
                <button
                  onClick={() => {
                    // This would trigger a mode change in parent component
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reschedule
                </button>
              )}
              {onCancel && (
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Cancelling...' : 'Cancel Schedule'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={minDate}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={scheduledDate === minDate ? minTime : undefined}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes about this scheduled post..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (mode === 'schedule' ? 'Schedule Post' : 'Update Schedule')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ScheduleModal;
