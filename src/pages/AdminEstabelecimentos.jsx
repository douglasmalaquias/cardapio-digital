import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminEstabelecimentos() {
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoNome, setNovoNome] = useState('');
  const [novoSlug, setNovoSlug] = useState('');

  // Carrega a lista ao abrir a tela
  useEffect(() => {
    carregarEstabelecimentos();
  }, []);

  async function carregarEstabelecimentos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('estabelecimentos')
      .select('*')
      .order('nome');
      
    if (!error) setEstabelecimentos(data || []);
    setLoading(false);
  }

  // Função para salvar um novo estabelecimento no banco
  async function handleAdicionar(e) {
    e.preventDefault();
    if (!novoNome || !novoSlug) return alert('Preencha o nome e o slug!');

    // Tenta inserir no Supabase
    const { error } = await supabase.from('estabelecimentos').insert([
      { nome: novoNome, slug: novoSlug }
    ]);

    if (error) {
      alert('Erro ao criar: ' + error.message);
    } else {
      setNovoNome('');
      setNovoSlug('');
      carregarEstabelecimentos(); // Atualiza a tabela na tela
      alert('Estabelecimento criado com sucesso!');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-gray-800 mb-6 uppercase tracking-tight">
          Gestão de Estabelecimentos
        </h1>

        {/* Formulário para Adicionar Novo */}
        <div className="bg-white p-6 rounded-xl shadow-xs border mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            Adicionar Novo Cliente
          </h2>
          <form onSubmit={handleAdicionar} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Estabelecimento</label>
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Ex: Padaria do Zé"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Slug (Link Público)</label>
              <input
                type="text"
                value={novoSlug}
                onChange={(e) => setNovoSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Ex: padaria-do-ze"
              />
            </div>
            <button 
              type="submit" 
              className="w-full md:w-auto bg-gray-900 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              Cadastrar
            </button>
          </form>
        </div>

        {/* Tabela de Estabelecimentos Cadastrados */}
        <div className="bg-white rounded-xl shadow-xs border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase">Nome</th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase">Link (Slug)</th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-gray-500">Carregando lista...</td>
                </tr>
              ) : (
                estabelecimentos.map(est => (
                  <tr key={est.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-800">{est.nome}</td>
                    <td className="p-4 text-gray-500 text-sm">/{est.slug}</td>
                    <td className="p-4 text-center">
                      <a 
                        href={`/${est.slug}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-amber-600 font-bold text-sm hover:underline"
                      >
                        Ver Cardápio ↗
                      </a>
                    </td>
                  </tr>
                ))
              )}
              {estabelecimentos.length === 0 && !loading && (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-gray-500">Nenhum estabelecimento cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
