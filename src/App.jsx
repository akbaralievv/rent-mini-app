import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NewsPage from './pages/NewsPage'
import NewsDetail from './pages/NewsDetail'
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    if (!window.Telegram?.WebApp) return;

    const tg = window.Telegram.WebApp;

    tg.ready();
    tg.expand();

  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewsPage />} />
         <Route path="/news/:id" element={<NewsDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
