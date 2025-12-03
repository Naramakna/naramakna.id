import SimpleRouter from "./components/Router/SimpleRouter";
import { AuthProvider } from './contexts/AuthContext';
import { AdsProvider } from './contexts/AdsContext';
import "./App.css";
import "./styles/article.css";
import "./styles/editor.css"; // Kumparan editor styles

// Import API debug untuk development
if (import.meta.env.DEV) {
  import('./utils/api-debug');
}

function App() {
  return (
    <AuthProvider>
      <AdsProvider>
        <div className="App">
          <SimpleRouter />
        </div>
      </AdsProvider>
    </AuthProvider>
  );
}

export default App;