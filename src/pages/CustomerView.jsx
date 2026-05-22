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

  // Mapeamento de temas (deve coincidir com o ID que está no seu banco)
  const temaOpcoes = {
    amber: { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-500', btn: 'bg-amber-500 hover:bg-amber-600', active: 'bg-gray-900' },
    red:   { bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700', active: 'bg-red-900' },
    blue:  { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700', active: 'bg-blue-900' },
    green: { bg: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-600', btn: 'bg-green-600 hover:bg-green-700', active: 'bg-green-900' },
    black: { bg: 'bg-gray-900', hover: 'hover:bg-black', text: 'text-gray-900', btn: 'bg-gray-900 hover:bg-black', active: 'bg-gray-950' }
  };

  useEffect(() => {
    async function carregarCardapio() {
      try {
        setLoading(true);
        const { data: est } = await supabase.from('estabelecimentos').select('*').eq('slug', slug).single();
        if (!est) {
            setLoading(false);
            return;
        }
        setEstabelecimento(est);

        const { data: cats } = await supabase.from('categorias').select('*').eq('estabelecimento_id', est.id).order('nome');
        setCategorias(cats || []);

        const { data: prods } = await supabase.from('produtos').select('*').eq('estabelecimento_id', est.id).eq('ativo', true).order('nome');
        setProdutos(prods || []);

        const { data: ads } = await supabase.from('anuncios').select('*').eq('estabelecimento_id', est.id).eq('active', true);
        setAnuncios(ads || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregarCardapio();
  }, [slug]);

  // PROTEÇÃO EXTRA: Se ainda está a carregar ou não achou o estabelecimento, não tenta ler 'tema'
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!estabelecimento) return <div className="min-h-screen flex items-center justify-center">Estabelecimento não encontrado.</div>;

  // AGORA É SEGURO LER O TEMA
  const tema = temaOpcoes[estabelecimento.tema] || temaOpcoes['amber'];
  const produtosFiltrados = categoriaAtiva === 'Todos' ? produtos : produtos.filter(p => p.categoria === categoriaAtiva);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 font-sans text-gray-900 relative">
      <header className={`${tema.bg} text-white p-6 shadow-lg sticky top-0 z-40`}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          {estabelecimento.logo_url ? (
            <img src={estabelecimento.logo_url} alt={estabelecimento.nome} className="w-11 h-11 rounded-xl object-cover border" />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center text-xl font-bold">🏪</div>
          )}
          <h1 className="font-black text-base uppercase tracking-tight leading-none">{estabelecimento.nome}</h1>
        </div>
      </header>

      {/* Categorias com cor dinâmica */}
      <nav className="max-w-5xl mx-auto px-4 pt-4 sticky top-[73px] z-30 bg-gray-50/90 backdrop-blur-md py-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          <button onClick={() => setCategoriaAtiva('Todos')} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${categoriaAtiva === 'Todos' ? `${tema.active} text-white` : 'bg-white border text-gray-500'}`}>
            Todos
          </button>
          {categorias.map(cat => (
            <button key={cat.id} onClick={() => setCategoriaAtiva(cat.nome)} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${categoriaAtiva === cat.nome ? `${tema.active} text-white` : 'bg-white border text-gray-500'}`}>
              {cat.nome}
            </button>
          ))}
        </div>
      </nav>

      {/* Lista de produtos */}
      <main className="max-w-5xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {produtosFiltrados.map(prod => (
            <div key={prod.id} onClick={() => setProdutoModal(prod)} className="bg-white p-4 rounded-2xl flex flex-row items-start gap-4 shadow-xs border cursor-pointer">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{prod.nome}</h3>
                <p className={`font-black mt-2 ${tema.text}`}>R$ {prod.preco.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal com cor dinâmica */}
      {produtoModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <h2 className="text-xl font-bold">{produtoModal.nome}</h2>
            <button onClick={() => setProdutoModal(null)} className={`${tema.btn} text-white font-bold w-full py-4 rounded-xl mt-6`}>
              Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}