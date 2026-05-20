import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CustomerView from './pages/CustomerView';
import AdminView from './pages/AdminView';
import AdminAdsView from './pages/AdminAdsView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<CustomerView />} />
        <Route path="/admin/:slug/produtos" element={<AdminView />} />
        <Route path="/admin/:slug/anuncios" element={<AdminAdsView />} />
      </Routes>
    </BrowserRouter>
  );
}