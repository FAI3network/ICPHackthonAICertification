import React from 'react';
import ReactDOM from 'react-dom/client';
import { App, Leaderboard, Model } from './pages';
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
            <Route index element={<Leaderboard />} />
            <Route path="model/:modelId" element={<Model />} />
          </Route>
        </Routes>
      </Router>
    </React.StrictMode >,
  );
} else {
  console.error('Root element not found');
}
