import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import AlgorithmPage from './pages/AlgorithmPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="algorithm/:slug" element={<AlgorithmPage />} />
      </Route>
    </Routes>
  );
}

export default App;
