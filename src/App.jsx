import React, { useState } from 'react';
import CustomerView from './pages/CustomerView';
import AdminView from './pages/AdminView';
import AdminAdsView from './pages/AdminAdsView';
import Header from './components/customer/Header';

export default function App() {
  // Estados possíveis: 'cliente', 'admin-produtos', 'admin-anuncios'
  const [telaAtiva, setTelaAtiva] = useState('cliente');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* O Header gerencia a troca de telas de forma oculta */}
      <Header onMudarTela={setTelaAtiva} />

      {/* Roteamento simples condicional */}
      {telaAtiva === 'cliente' && <CustomerView />}
      {telaAtiva === 'admin-produtos' && <AdminView />}
      {telaAtiva === 'admin-anuncios' && <AdminAdsView />}
      
      {/* Botões antigos fixados no rodapé foram completamente removidos daqui! */}
    </div>
  );
}