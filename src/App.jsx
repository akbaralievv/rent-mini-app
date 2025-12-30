import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NewsPage from './pages/news/NewsPage'
import NewsDetail from './pages/news/NewsDetail'
import { useEffect } from 'react';
import { useAuth } from './auth/useAuth';
import LoginPage from './pages/login/LoginPage';
import Menu from './pages/menu/Menu';
import ContractsPage from './pages/contracts/ContractsPage';


function Router() {
  const { status } = useAuth();

  if (status === "loading") return <div className="loader-wrap">
    <div className="loader" />
  </div>;
  if (status === "guest") return <LoginPage />;

  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/news/:id" element={<NewsDetail />} />
      <Route path="/contracts" element={<ContractsPage />} />
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
