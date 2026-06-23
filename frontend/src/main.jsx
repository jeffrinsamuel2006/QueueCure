import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './pages/App.jsx';
import AnalyticsDashboard from './pages/AnalyticsDashboard.jsx';
import LiveQueueBoard from './pages/LiveQueueBoard.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import ReceptionistDashboard from './pages/ReceptionistDashboard.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Navigate to="/receptionist" replace />} />
          <Route path="/receptionist" element={<ReceptionistDashboard />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/board" element={<LiveQueueBoard />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
