import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import CopilotPage from './pages/CopilotPage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import GlobalThemeToggle from './components/copilot/ThemeToggle';

function MainApp() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentSearch, setCurrentSearch] = useState(window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setCurrentSearch(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (toUrl) => {
    const urlObj = new URL(toUrl, window.location.origin);
    window.history.pushState({}, '', urlObj.pathname + urlObj.search);
    setCurrentPath(urlObj.pathname);
    setCurrentSearch(urlObj.search);
    window.scrollTo(0, 0);
  };

  // Determine initial view from query param ?view=analytics
  const searchParams = new URLSearchParams(currentSearch);
  const viewParam = searchParams.get('view');

  // Routing: /app -> Copilot Workspace, / or /landing -> Landing Page
  if (currentPath === '/app') {
    return <CopilotPage onNavigate={navigate} initialView={viewParam} />;
  }

  return <LandingPage onNavigate={navigate} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
        <GlobalThemeToggle />
      </AuthProvider>
    </ThemeProvider>
  );
}
