import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CustomerView from './pages/CustomerView';
import AdminEstabelecimentos from './pages/AdminEstabelecimentos';
import AdminProdutos from './pages/AdminProdutos';
import AdminAnuncios from './pages/AdminAnuncios'; // <-- ADICIONADO AQUI
import Login from './pages/Login';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/clientes" element={<AdminEstabelecimentos />} />
        <Route path="/admin/:slug/produtos" element={<AdminProdutos />} />
        
        {/* Nova rota de anúncios */}
        <Route path="/admin/:slug/anuncios" element={<AdminAnuncios />} /> 
        
        <Route path="/:slug" element={<CustomerView />} />
      </Routes>
    </Router>
  );
}
