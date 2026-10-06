import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ConnectorsList from './pages/ConnectorsList';
import ConnectorDetail from './pages/ConnectorDetail';
import CreateConnector from './pages/CreateConnector';
import TestConnector from './pages/TestConnector';
import Documentation from './pages/Documentation';
import Statistics from './pages/Statistics';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/connectors" element={<ConnectorsList />} />
          <Route path="/connectors/new" element={<CreateConnector />} />
          <Route path="/connectors/:id" element={<ConnectorDetail />} />
          <Route path="/connectors/:id/test" element={<TestConnector />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
