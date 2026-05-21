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
        // Se não houver utilizador ativo, expulsa para a tela de login
        navigate('/login');
      } else {
        // Se estiver logado, liberta o ecrã
        setCheckingAuth(false);
      }
    }
    verificarSessao();
  }, [navigate]);

  const acessarPainelLojista = (e) => {
    e.preventDefault();
    if (!slugInput.trim()) return alert('Por favor, introduza o código/slug da sua loja!');
    navigate(`/admin/${slugInput.trim().toLowerCase()}/produtos`);
  };

  // Enquanto verifica o banco de dados, mostra uma tela neutra
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 font-medium">
        A validar credenciais de segurança...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-900">
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
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-xs"
            >
              Aceder ao Painel Comercial
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
              onClick={() => navigate('/admin/minha-hamburgueria/anuncios')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-xs"
            >
              Gerir Campanhas de Anúncios
            </button>
            <button 
              onClick={() => navigate('/admin/clientes')}
              className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm py-2.5 rounded-xl transition-all"
            >
              Painel de Clientes SaaS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
