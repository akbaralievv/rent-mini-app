import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import NewsPage from './pages/news/NewsPage';
import NewsDetail from './pages/news/NewsDetail';
import { useEffect } from 'react';
import { useAuth } from './auth/useAuth';
import LoginPage from './pages/login/LoginPage';
import Menu from './pages/menu/Menu';
import ContractsPage from './pages/contracts/ContractsPage';
import ContractsDetail from './pages/contracts/ContractsDetail';
import ContractWizard from './pages/contracts/ContractWizzard';
import ContractTemplatesPage from './pages/contracts/contractTemplates/ContractTemplatesPage';
import ContractTemplatesWizzard from './pages/contracts/contractTemplates/ContractTemplatesWizzard';

function Router() {
  const { status } = useAuth();
  const { id } = useParams();

  if (status === 'loading')
    return (
      <div className="loader-wrap">
        <div className="loader" />
      </div>
    );
  if (status === 'guest') return <LoginPage />;

  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/news/:id" element={<NewsDetail />} />
      <Route path="/contracts" element={<ContractsPage />} />
      <Route path="/contracts/new" element={<ContractWizard key={id ?? 'new'} />} />
      <Route path="/contracts/:id/edit" element={<ContractWizard key={id ?? 'new'} />} />
      <Route path="/contracts/:id" element={<ContractsDetail />} />
      <Route path="/contracts/templates" element={<ContractTemplatesPage />} />
      <Route path="/contracts/templates/new" element={<ContractTemplatesWizzard key={id ?? 'new'} />} />
      <Route path="/contracts/templates/:id/edit" element={<ContractTemplatesWizzard key={id ?? 'new'} />} />
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
  );
}

export default App;
