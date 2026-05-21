import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CustomerView from './pages/CustomerView';
import AdminEstabelecimentos from './pages/AdminEstabelecimentos';
import Login from './pages/Login'; // <-- ADICIONADO AQUI

export default function App() {
  return (
    <Routes>
      {/* Rota Pública do Hub Inicial */}
      <Route path="/" element={<Home />} />
      
      {/* Rota de Autenticação */}
      <Route path="/login" element={<Login />} /> {/* <-- ADICIONADO AQUI */}
      
      {/* Rota de Gestão de Clientes SaaS */}
      <Route path="/admin/clientes" element={<AdminEstabelecimentos />} />
      
      {/* Rota de Visualização do Cardápio Público */}
      <Route path="/:slug" element={<CustomerView />} />
    </Routes>
  );
}
