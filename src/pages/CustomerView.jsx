import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function CustomerView() {
  const { slug } = useParams();
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapeamento de cores (a chave 'amber', 'red' etc. deve bater com o ID que está no Admin)
  const temaOpcoes = {
    amber: { bg: 'bg-amber-500', text: 'text-amber-500', btn: 'bg-amber-500 hover:bg-amber-600' },
    red:   { bg: 'bg-red-600', text: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700' },
    blue:  { bg: 'bg-blue-600', text: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700' },
    green: { bg: 'bg-green-600', text: 'text-green-600', btn: 'bg-green-600 hover:bg-green-700' },
    black: { bg: 'bg-gray-900', text: 'text-gray-900', btn: 'bg-gray-900 hover:bg-black' }
  };

  useEffect(() => {
    async function carregarDados() {
      try {
        const { data: est } = await supabase.from('estabelecimentos').select('*').eq('slug', slug).single();
        if (!est) return;
        setEstabelecimento(est);
        const { data: cats } = await supabase.from('categorias').select('*').eq('estabelecimento_id', est.id).order('nome');
        setCategorias(cats || []);
        const { data: prods } = await supabase.from('produtos').select('*').eq('estabelecimento_id', est.id).eq('ativo', true).order('nome');
        setProdutos(prods || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    carregarDados();
  }, [slug]);

  if (loading || !estabelecimento) return <div>Carregando...</div>;

  // CORREÇÃO: Lê a coluna 'tema' do banco
  const tema = temaOpcoes[estabelecimento.tema] || temaOpcoes['amber'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className={`${tema.bg} text-white p-6 shadow-lg`}>
        <h1 className="text-2xl font-black">{estabelecimento.nome}</h1>
      </header>

      {/* Exemplo de uso da cor dinâmica */}
      <div className="p-4">
        {categorias.map(cat => (
           <h2 key={cat.id} className={`font-black ${tema.text}`}>{cat.nome}</h2>
        ))}
      </div>
      
      {/* O resto da sua estrutura original de 217 linhas deve vir aqui */}
    </div>
  );
}