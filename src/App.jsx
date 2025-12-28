import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NewsPage from './pages/NewsPage'
import NewsDetail from './pages/NewsDetail'
import { useEffect } from 'react';
import { useAuth } from './auth/useAuth';
import LoginPage from './pages/LoginPage';


function Router() {
  const { status } = useAuth();

  if (status === "loading") return <div className="loader-wrap">
    <div className="loader" />
  </div>;
  if (status === "guest") return <LoginPage />;

  return (
    <Routes>
      <Route path="/" element={<NewsPage />} />
      <Route path="/news/:id" element={<NewsDetail />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    if (!window.Telegram?.WebApp) return;

    const tg = window.Telegram.WebApp;

    tg.ready();
    tg.expand();

  }, []);
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  )
}

export default App
