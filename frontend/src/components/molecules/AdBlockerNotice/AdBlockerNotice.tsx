import React, { useEffect, useState } from 'react';
import { detectAdBlocker, getBrowserInfo, type AdBlockDetectionResult } from '../../../utils/adBlockDetector';

interface AdBlockerNoticeProps {
  onDismiss?: () => void;
  showDebugInfo?: boolean;
}

export const AdBlockerNotice: React.FC<AdBlockerNoticeProps> = ({
  onDismiss,
  showDebugInfo = false
}) => {
  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const [detectionResult, setDetectionResult] = useState<AdBlockDetectionResult | null>(null);
  const [browserInfo, setBrowserInfo] = useState<ReturnType<typeof getBrowserInfo> | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed the notice
    const dismissed = localStorage.getItem('adBlockerNoticeDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Detect ad blocker
    const checkAdBlocker = async () => {
      const result = await detectAdBlocker();
      const browser = getBrowserInfo();

      setDetectionResult(result);
      setBrowserInfo(browser);
      setIsAdBlocked(result.isBlocked);

      if (process.env.NODE_ENV === 'development') {
        console.log('🛡️ AdBlocker Detection:', result);
        console.log('🌐 Browser Info:', browser);
      }
    };

    // Run detection after page loads
    const timer = setTimeout(checkAdBlocker, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('adBlockerNoticeDismissed', 'true');
    if (onDismiss) {
      onDismiss();
    }
  };

  const handlePermanentDismiss = () => {
    handleDismiss();
  };

  // Don't show if dismissed or no ad blocker detected
  if (isDismissed || !isAdBlocked || !detectionResult) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow-2xl z-50 animate-slide-up">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="font-bold text-lg">AdBlocker Terdeteksi</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Tutup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message */}
        <p className="text-sm mb-3 leading-relaxed">
          Kami mendeteksi bahwa Anda menggunakan AdBlocker{browserInfo?.isChrome && ' di Chrome'}.
          Iklan membantu kami menyediakan konten berkualitas secara gratis.
        </p>

        {/* Chrome specific message */}
        {browserInfo?.isChrome && (
          <div className="bg-white bg-opacity-20 rounded p-3 mb-3 text-sm">
            <p className="font-semibold mb-1">💡 Untuk Chrome:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Disable extension AdBlocker untuk naramakna.id</li>
              <li>Atau whitelist situs kami</li>
              <li>Refresh halaman setelah disable</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handlePermanentDismiss}
            className="flex-1 bg-white text-orange-600 font-semibold py-2 px-4 rounded hover:bg-gray-100 transition-colors text-sm"
          >
            Mengerti
          </button>
          <a
            href="https://support.google.com/chrome/answer/7632919"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-orange-600 bg-opacity-50 text-white font-semibold py-2 px-4 rounded hover:bg-opacity-70 transition-colors text-sm text-center"
          >
            Cara Disable
          </a>
        </div>

        {/* Debug Info */}
        {showDebugInfo && detectionResult && (
          <div className="mt-3 pt-3 border-t border-white border-opacity-30">
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold mb-1">Debug Info</summary>
              <div className="bg-black bg-opacity-30 rounded p-2 mt-2 space-y-1">
                <div>Method: {detectionResult.method}</div>
                <div>Confidence: {detectionResult.confidence}</div>
                <div>Browser: {browserInfo?.browser}</div>
                <div className="truncate">UA: {browserInfo?.userAgent.substring(0, 50)}...</div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};
