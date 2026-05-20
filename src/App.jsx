import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerView from './pages/CustomerView';
import AdminView from './pages/AdminView';
import AdminAdsView from './pages/AdminAdsView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota dinâmica do cliente: aceita qualquer slug de restaurante após a barra */}
        <Route path="/:slug" element={<CustomerView />} />

        {/* Rotas da administração */}
<Route path="/admin/:slug/produtos" element={<AdminView />} />
<Route path="/admin/:slug/anuncios" element={<AdminAdsView />} />

        {/* Se alguém entrar na raiz sem nada, redireciona temporariamente para o nosso teste */}
        <Route path="*" element={<Navigate to="/minha-hamburgueria" replace />} />
      </Routes>
    </BrowserRouter>
  );
}