import React, { useState } from 'react';

export default function Header({ onMudarTela }) {
  const [menuAdminAberto, setMenuAdminAberto] = useState(false);
  const [exibirPinModal, setExibirPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [telaDestino, setTelaDestino] = useState('');

  // 🔒 DEFINA SUA SENHA DE ADMIN AQUI
  const PIN_CORRETO = '1234';

  const chamarGarcomAction = () => {
    alert('🔔 Garçom acionado para a Mesa 04!');
  };

  // Prepara para pedir a senha antes de mudar de tela
  const solicitarAcesso = (tela) => {
    setTelaDestino(tela);
    setMenuAdminAberto(false);
    setExibirPinModal(true);
  };

  // Valida a senha digitada
  const validarPin = (e) => {
    e.preventDefault();
    if (pin === PIN_CORRETO) {
      onMudarTela(telaDestino);
      setExibirPinModal(false);
      setPin('');
    } else {
      alert('❌ PIN Incorreto! Acesso negado.');
      setPin('');
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center relative">
          
          {/* Botão de Menu Secreto no Logo */}
          <div 
            onClick={() => setMenuAdminAberto(!menuAdminAberto)}
            className="cursor-pointer select-none"
          >
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Burger<span className="text-amber-500">Factory</span>
            </h1>
          </div>

          <button
            onClick={chamarGarcomAction}
            className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-amber-200/50 active:scale-95"
          >
            <span>🔔</span>
            <span className="hidden sm:inline">Chamar Garçom</span>
          </button>

          {/* Menu Oculto */}
          {menuAdminAberto && (
            <div className="absolute left-0 top-12 bg-gray-900 text-white rounded-xl shadow-xl p-2 flex flex-col gap-1 text-xs font-semibold z-50 border border-gray-800 animate-fade-in">
              <button 
                onClick={() => { onMudarTela('cliente'); setMenuAdminAberto(false); }}
                className="px-4 py-2 hover:bg-gray-800 rounded-lg text-left"
              >
                📱 Ver Cardápio (Cliente)
              </button>
              <button 
                onClick={() => solicitarAcesso('admin-produtos')}
                className="px-4 py-2 hover:bg-gray-800 rounded-lg text-left text-amber-400"
              >
                🍔 Admin: Produtos
              </button>
              <button 
                onClick={() => solicitarAcesso('admin-anuncios')}
                className="px-4 py-2 hover:bg-gray-800 rounded-lg text-left text-blue-400"
              >
                📺 Admin: Banners
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 🔒 Modal de PIN */}
      {exibirPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center">
            <button 
              onClick={() => { setExibirPinModal(false); setPin(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
            >
              ✕
            </button>
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Acesso Restrito</h3>
            <p className="text-gray-500 text-sm mb-6">Digite o PIN para acessar o painel administrativo.</p>
            
            <form onSubmit={validarPin} className="flex flex-col gap-4">
              <input 
                type="password" 
                inputMode="numeric"
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="text-center text-2xl tracking-[0.5em] font-bold border border-gray-300 rounded-xl px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
              />
              <button 
                type="submit"
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Acessar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}