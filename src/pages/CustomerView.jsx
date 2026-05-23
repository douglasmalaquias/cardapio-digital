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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregarCardapio();
  }, [slug]);

  useEffect(() => {
    if (anuncios.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % anuncios.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [anuncios]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-medium text-gray-500">Carregando cardápio...</div>;
  if (!estabelecimento) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-medium text-gray-500">Estabelecimento não encontrado.</div>;

  const produtosFiltrados = categoriaAtiva === 'Todos' ? produtos : produtos.filter(p => p.categoria === categoriaAtiva);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 font-sans text-gray-900 relative">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          {estabelecimento.logo_url ? (
            <img src={estabelecimento.logo_url} alt={estabelecimento.nome} className="w-11 h-11 rounded-xl object-cover border" />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xl font-bold">🏪</div>
          )}
          <h1 className="font-black text-base uppercase tracking-tight leading-none">{estabelecimento.nome}</h1>
        </div>
      </header>

      {/* CARROSSEL DE ANÚNCIOS */}
      {anuncios.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="relative aspect-[4/3] sm:aspect-[16/9] md:h-80 w-full rounded-3xl overflow-hidden shadow-xs border bg-black group">
            <div className="w-full h-full relative">
              {anuncios.map((ad, index) => (
                <div
                  key={ad.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                    index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img src={ad.image} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110" />
                  <img src={ad.image} alt={ad.title} className="relative z-10 w-full h-full object-contain object-center animate-fade-in" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-6 text-center z-20">
                    <h2 className="text-white font-black text-base md:text-2xl uppercase tracking-wide drop-shadow-lg max-w-xl leading-tight">
                      {ad.title}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
            {anuncios.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-30 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-full">
                {anuncios.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBanner(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentBanner ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CATEGORIAS */}
      <nav className="max-w-5xl mx-auto px-4 pt-4 sticky top-[73px] z-30 bg-gray-50/90 backdrop-blur-md py-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          <button 
            onClick={() => setCategoriaAtiva('Todos')} 
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${categoriaAtiva === 'Todos' ? 'bg-gray-900 text-white' : 'bg-white border text-gray-500'}`}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setCategoriaAtiva(cat.nome)} 
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${categoriaAtiva === cat.nome ? 'bg-gray-900 text-white' : 'bg-white border text-gray-500'}`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </nav>

      {/* LISTA DE PRODUTOS - ESTILO IFOOD */}
      <main className="max-w-5xl mx-auto px-4 pt-4">
        {/* Usamos md:grid-cols-2 para criar duas listas paralelas no tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {produtosFiltrados.map(prod => (
            <div 
              key={prod.id} 
              onClick={() => setProdutoModal(prod)} // O clique agora é no card inteiro
              className="bg-white p-4 rounded-2xl flex flex-row items-start gap-4 shadow-xs border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative"
            >
              
              {/* Esquerda: Textos do Produto */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                <div>
                  <h3 className="font-semibold text-gray-900 text-base leading-tight pr-2 truncate">{prod.nome}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-snug pr-2">{prod.descricao || 'Sem descrição cadastrada.'}</p>
                </div>
                <div className="font-medium text-gray-900 mt-3">
                  R$ {prod.preco.toFixed(2)}
                </div>
              </div>

              {/* Direita: Imagem Quadrada */}
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                {prod.image_url ? (
                  <img src={prod.image_url} alt={prod.nome} className="w-full h-full object-cover object-center" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🍔</div>
                )}
              </div>

            </div>
          ))}
        </div>
        
        {produtosFiltrados.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white border border-dashed rounded-3xl text-sm font-medium mt-4">
            Nenhum produto cadastrado nesta categoria.
          </div>
        )}
      </main>

      {/* MODAL DETALHES */}
      {produtoModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl max-w-md overflow-hidden shadow-2xl relative flex flex-col animate-zoom-in">
            <button 
              onClick={() => setProdutoModal(null)} 
              className="absolute top-4 right-4 bg-white/90 hover:bg-white w-8 h-8 rounded-full flex items-center justify-center font-black z-30 shadow-md text-gray-700"
            >
              ✕
            </button>
            
            <div className="w-full h-64 bg-gray-50 flex items-center justify-center border-b shrink-0 relative overflow-hidden">
              {produtoModal.image_url ? (
                <img src={produtoModal.image_url} alt={produtoModal.nome} className="relative z-10 w-full h-full object-cover object-center" />
              ) : (
                <div className="text-6xl opacity-30">🍔</div>
              )}
            </div>

            <div className="p-6 relative z-10">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight">{produtoModal.nome}</h2>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">{produtoModal.descricao || 'Este item não possui descrição detalhada.'}</p>
              
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-1">Total</span>
                  <span className="text-2xl font-semibold text-gray-900 leading-none">R$ {produtoModal.preco.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => {
                    alert('Item selecionado! (Aqui entrará a lógica do carrinho futuramente)');
                    setProdutoModal(null);
                  }} 
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3.5 px-8 rounded-xl transition-colors text-sm"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}