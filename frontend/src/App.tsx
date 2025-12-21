import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import SimpleRouter from "./components/Router/SimpleRouter";
import { AuthProvider } from './contexts/AuthContext';
import { AdsProvider } from './contexts/AdsContext';
import { AdBlockerNotice } from './components/molecules/AdBlockerNotice';
import { PopupAd } from './components/organisms/PopupAd';
import "./App.css";
import "./styles/article.css";
import "./styles/editor.css"; // Kumparan editor styles

// Import API debug untuk development
if (import.meta.env.DEV) {
  import('./utils/api-debug');
}

function App() {
  // Load AdSense script on app mount
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (existingScript) {
      return;
    }

    // Inject AdSense script
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5027382595607261';
    script.async = true;
    script.crossOrigin = 'anonymous';

    document.head.appendChild(script);
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <AdsProvider>
          <div className="App">
            <SimpleRouter />
            {/* AdBlocker Notice - only shows if ad blocker detected */}
            <AdBlockerNotice showDebugInfo={import.meta.env.DEV} />
            {/* Popup Ad - shows once per day */}
            <PopupAd />
          </div>
        </AdsProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;