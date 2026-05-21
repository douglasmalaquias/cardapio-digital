import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CustomerView from './pages/CustomerView';
import AdminEstabelecimentos from './pages/AdminEstabelecimentos';
import AdminProdutos from './pages/AdminProdutos'; // <-- ADICIONADO AQUI
import Login from './pages/Login';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rota Pública do Hub Inicial */}
        <Route path="/" element={<Home />} />
        
        {/* Rota de Autenticação */}
        <Route path="/login" element={<Login />} />
        
        {/* Rota de Gestão de Clientes SaaS (Sua) */}
        <Route path="/admin/clientes" element={<AdminEstabelecimentos />} />
        
        {/* Rota de Gestão de Produtos (Do Lojista) */}
        <Route path="/admin/:slug/produtos" element={<AdminProdutos />} /> {/* <-- ADICIONADO AQUI */}
        
        {/* Rota de Visualização do Cardápio Público */}
        <Route path="/:slug" element={<CustomerView />} />
      </Routes>
    </Router>
  );
}
