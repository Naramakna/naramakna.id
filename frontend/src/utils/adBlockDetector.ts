/**
 * AdBlock Detector Utility
 * Detects if user has ad blocker enabled
 */

export interface AdBlockDetectionResult {
  isBlocked: boolean;
  method: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Comprehensive ad blocker detection
 * Returns true if ad blocker is detected
 */
export const detectAdBlocker = async (): Promise<AdBlockDetectionResult> => {
  // Method 1: Check if adsbygoogle array is modified
  if (window.adsbygoogle && window.adsbygoogle.loaded === true) {
    return {
      isBlocked: false,
      method: 'adsbygoogle-loaded',
      confidence: 'high'
    };
  }

  // Method 2: Try to detect bait element
  const baitDetection = await detectWithBait();
  if (baitDetection.isBlocked) {
    return baitDetection;
  }

  // Method 3: Check for common ad blocker properties
  const commonBlockerDetection = detectCommonBlockers();
  if (commonBlockerDetection.isBlocked) {
    return commonBlockerDetection;
  }

  // Method 4: Check if pagead2.googlesyndication.com is accessible
  const networkDetection = await detectNetworkBlock();
  if (networkDetection.isBlocked) {
    return networkDetection;
  }

  // No ad blocker detected
  return {
    isBlocked: false,
    method: 'none',
    confidence: 'high'
  };
};

/**
 * Create a bait element that looks like an ad
 * Ad blockers will hide/remove this element
 */
const detectWithBait = (): Promise<AdBlockDetectionResult> => {
  return new Promise((resolve) => {
    // Create bait element
    const bait = document.createElement('div');
    bait.className = 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links advertisement';
    bait.style.cssText = 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;';

    // Add to DOM
    document.body.appendChild(bait);

    // Check after a short delay
    setTimeout(() => {
      // Check if element is hidden or removed
      const computedStyle = window.getComputedStyle(bait);
      const isHidden =
        computedStyle.display === 'none' ||
        computedStyle.visibility === 'hidden' ||
        bait.offsetHeight === 0 ||
        bait.offsetParent === null;

      // Cleanup
      document.body.removeChild(bait);

      if (isHidden) {
        resolve({
          isBlocked: true,
          method: 'bait-element',
          confidence: 'high'
        });
      } else {
        resolve({
          isBlocked: false,
          method: 'bait-element',
          confidence: 'medium'
        });
      }
    }, 100);
  });
};

/**
 * Check for common ad blocker properties
 */
const detectCommonBlockers = (): AdBlockDetectionResult => {
  // Check for common ad blocker variables
  const hasBlockerVars =
    // @ts-ignore - checking for ad blocker properties
    window.canRunAds === false ||
    // @ts-ignore
    window.adsbygoogle?.loaded === false ||
    // @ts-ignore
    document.body?.getAttribute('abp') !== null;

  if (hasBlockerVars) {
    return {
      isBlocked: true,
      method: 'blocker-variables',
      confidence: 'medium'
    };
  }

  return {
    isBlocked: false,
    method: 'blocker-variables',
    confidence: 'low'
  };
};

/**
 * Try to fetch AdSense script to check network blocking
 */
const detectNetworkBlock = async (): Promise<AdBlockDetectionResult> => {
  try {
    // Try to fetch a known ad resource
    const response = await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });

    // If we get here without error, likely not blocked
    return {
      isBlocked: false,
      method: 'network-check',
      confidence: 'medium'
    };
  } catch (error) {
    // Network request failed - might be blocked
    return {
      isBlocked: true,
      method: 'network-check',
      confidence: 'medium'
    };
  }
};

/**
 * Simple quick check for ad blocker
 * Use this for initial checks
 */
export const quickAdBlockCheck = (): boolean => {
  // Check if adsbygoogle script loaded
  if (!window.adsbygoogle) {
    return true;
  }

  // Check for ad blocker CSS that hides ads
  const testDiv = document.createElement('div');
  testDiv.className = 'adsbox';
  testDiv.style.cssText = 'position: absolute; left: -10000px;';
  document.body.appendChild(testDiv);

  const isBlocked = testDiv.offsetHeight === 0;
  document.body.removeChild(testDiv);

  return isBlocked;
};

/**
 * Detect if running on Chrome browser
 */
export const isChromeBrowser = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isChrome = /chrome/.test(userAgent) && !/edge|edg|opr/.test(userAgent);
  return isChrome;
};

/**
 * Get browser info for debugging
 */
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const isChrome = isChromeBrowser();
  const isEdge = /edg/.test(userAgent.toLowerCase());
  const isFirefox = /firefox/.test(userAgent.toLowerCase());
  const isSafari = /safari/.test(userAgent.toLowerCase()) && !/chrome/.test(userAgent.toLowerCase());

  return {
    userAgent,
    isChrome,
    isEdge,
    isFirefox,
    isSafari,
    browser: isChrome ? 'Chrome' : isEdge ? 'Edge' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'Unknown'
  };
};

// Global type declaration
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
