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
        {/* Rota Inicial / Hub Central da Plataforma */}
        <Route path="/" element={<Home />} />

        {/* Rota dinâmica do cliente tablet: aceita qualquer slug de restaurante */}
        <Route path="/:slug" element={<CustomerView />} />

        {/* Rotas de administração do lojista e anúncios */}
        <Route path="/admin/:slug/produtos" element={<AdminView />} />
        <Route path="/admin/:slug/anuncios" element={<AdminAdsView />} />
      </Routes>
    </BrowserRouter>
  );
}