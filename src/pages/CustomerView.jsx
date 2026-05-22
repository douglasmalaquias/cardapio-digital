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
  const [currentBanner, setCurrentBanner] = useState(0);

  // MOTOR DE TEMAS: Adicionado sem remover sua estrutura
  const temaOpcoes = {
    amber: { bg: 'bg-amber-500', text: 'text-amber-500', btn: 'bg-amber-500 hover:bg-amber-600', ring: 'ring-amber-500' },
    red:   { bg: 'bg-red-600', text: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700', ring: 'ring-red-600' },
    blue:  { bg: 'bg-blue-600', text: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700', ring: 'ring-blue-600' },
    green: { bg: 'bg-green-600', text: 'text-green-600', btn: 'bg-green-600 hover:bg-green-700', ring: 'ring-green-600' },
    black: { bg: 'bg-gray-900', text: 'text-gray-900', btn: 'bg-gray-900 hover:bg-black', ring: 'ring-gray-900' }
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

        const { data: ads } = await supabase.from('anuncios').select('*').eq('estabelecimento_id', est.id).eq('active', true);
        setAnuncios(ads || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    carregarCardapio();
  }, [slug]);

  if (loading || !estabelecimento) return <div>Carregando...</div>;

  // Lógica de tema aplicada
  const tema = temaOpcoes[estabelecimento.tema] || temaOpcoes['amber'];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 font-sans text-gray-900">
      <header className={`${tema.bg} text-white p-6 shadow-lg`}>
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          {estabelecimento.logo_url && <img src={estabelecimento.logo_url} className="w-16 h-16 rounded-full border-2 border-white object-cover" />}
          <h1 className="text-2xl font-black">{estabelecimento.nome}</h1>
        </div>
      </header>

      {/* Exemplo de aplicação no botão do Modal dentro da sua estrutura original */}
      {produtoModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl">
            <h2 className="text-xl font-bold">{produtoModal.nome}</h2>
            <button 
              onClick={() => setProdutoModal(null)}
              className={`${tema.btn} text-white font-bold w-full py-4 rounded-xl mt-6`}
            >
              Adicionar ao Pedido
            </button>
          </div>
        </div>
      )}
      
      {/* ... (Seu código original continua igual abaixo) ... */}
    </div>
  );
}