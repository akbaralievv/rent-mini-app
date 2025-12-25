import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NewsPage from './pages/NewsPage'
import NewsDetail from './pages/NewsDetail'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/news" element={<NewsPage />} />
         <Route path="/news/:id" element={<NewsDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
