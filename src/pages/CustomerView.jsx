import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function CustomerView() {
  const { slug } = useParams();
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [produtoModal, setProdutoModal] = useState(null);

  // CONFIGURAÇÃO DINÂMICA DE CORES
  const temaOpcoes = {
    amber: { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-500', ring: 'ring-amber-500' },
    red:   { bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-600', ring: 'ring-red-600' },
    blue:  { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', ring: 'ring-blue-600' },
    green: { bg: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-600', ring: 'ring-green-600' },
    black: { bg: 'bg-gray-900', hover: 'hover:bg-black', text: 'text-gray-900', ring: 'ring-gray-900' }
  };

  useEffect(() => {
    async function carregarCardapio() {
      try {
        setLoading(true);
        const { data: est } = await supabase.from('estabelecimentos').select('*').eq('slug', slug).single();
        if (!est) return;
        setEstabelecimento(est);

        const { data: cats } = await supabase.from('categorias').select('*').eq('estabelecimento_id', est.id).order('nome');
        setCategorias(cats || []);

        const { data: prods } = await supabase.from('produtos').select('*').eq('estabelecimento_id', est.id).eq('ativo', true).order('nome');
        setProdutos(prods || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    carregarCardapio();
  }, [slug]);

  if (loading || !estabelecimento) return <div>Carregando...</div>;

  // Define o tema com fallback para 'amber'
  const tema = temaOpcoes[estabelecimento.tema] || temaOpcoes['amber'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* HEADER: Substituído bg-amber-500 por {tema.bg} */}
      <header className={`${tema.bg} text-white p-6 shadow-lg`}>
         <h1 className="text-2xl font-black">{estabelecimento.nome}</h1>
      </header>

      {/* Exemplo de uso no botão do seu Modal (dentro do código do seu modal existente) */}
      {/* Onde você tinha className="bg-amber-500 hover:bg-amber-600..." */}
      {/* Mude para: */}
      <button 
        onClick={() => setProdutoModal(null)} 
        className={`${tema.bg} ${tema.hover} text-white font-semibold py-3.5 px-8 rounded-xl transition-colors`}
      >
        Adicionar ao Pedido
      </button>

      {/* O restante do seu código (banners, categorias, grid de produtos) permanece igual */}
      {/* Certifique-se de substituir o bg-amber-500 nas tags class pelas variáveis tema.bg, etc. */}
    </div>
  );
}