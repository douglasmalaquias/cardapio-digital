import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Home() {
  const navigate = useNavigate();
  const [slugInput, setSlugInput] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Executa assim que a página abre para verificar se o utilizador está logado
  useEffect(() => {
    async function verificarSessao() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      } else {
        setCheckingAuth(false);
      }
    }
    verificarSessao();
  }, [navigate]);

  // Função para encerrar a sessão no Supabase Auth
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Erro ao sair do sistema: ' + error.message);
    } else {
      navigate('/login');
    }
  };

  const acessarPainelLojista = (e) => {
    e.preventDefault();
    if (!slugInput.trim()) return alert('Por favor, introduza o código/slug da sua loja!');
    
    // NAVEGAÇÃO REAL ATIVADA AQUI:
    navigate(`/admin/${slugInput.trim().toLowerCase()}/produtos`);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 font-medium">
        A validar credenciais de segurança...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
      
      {/* Barra Superior de Utilizador */}
      <header className="bg-white border-b p-4 shadow-xs relative z-10">
        <div className="max-w-6xl mx-auto flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-sm hover:shadow-md"
          >
            Sair do Sistema 🚪
          </button>
        </div>
      </header>

      {/* Conteúdo Principal do Hub */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-12 relative z-0">
        <div className="max-w-3xl w-full text-center space-y-4 mb-12">
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Plataforma Hub Central
          </span>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Sistema de Cardápios Interativos
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">
            Selecione o módulo de operação pretendido para aceder às diretrizes e configurações do ecossistema de autoatendimento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          
          {/* PAINEL DO LOJISTA (ADMIN DE LOJA) */}
          <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="bg-amber-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs">
                🏪
              </div>
              <h3 className="text-xl font-bold pt-2">Área do Lojista</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Acesso restrito para gerentes e proprietários de estabelecimentos gerirem produtos, estoques e abas do menu.
              </p>
            </div>

            <form onSubmit={acessarPainelLojista} className="space-y-3 pt-4 border-t">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Identificador da Loja (Slug)
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: minha-hamburgueria"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Acessar o Painel de Controle
              </button>
            </form>
          </div>

          {/* PAINEL DO ADMINISTRADOR (SISTEMA / VOCÊ) */}
          <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="bg-gray-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs">
                ⚡
              </div>
              <h3 className="text-xl font-bold pt-2">Administração Global</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Módulo master do proprietário do software. Monitoramento de campanhas publicitárias globais e criação de novas filiais.
              </p>
            </div>

            <div className="pt-4 border-t space-y-2">
              <button 
                type="button"
                onClick={() => alert('Interface de Gestão de Anúncios em breve!')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Gestão de Anúncios
              </button>
              <button 
                type="button"
                onClick={() => navigate('/admin/clientes')}
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Painel de Clientes SaaS
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
