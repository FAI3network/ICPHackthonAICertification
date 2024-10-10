import React from 'react';
import ReactDOM from 'react-dom/client';
import { App, Leaderboard } from './pages';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<App />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>
        </Routes>
      </Router>
    </React.StrictMode >,
  );
} else {
  console.error('Root element not found');
}
