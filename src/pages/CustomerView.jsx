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

  // Estado para controlar o banner ativo no carrossel
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

  // Timer do Carrossel (Troca a cada 4 segundos)
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

      {/* CARROSSEL DE ANÚNCIOS: PROPORÇÃO AJUSTADA PARA EVITAR CORTE NA FACHADA EM TABLETS */}
      {anuncios.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          {/* Trocamos 'h-44 sm:h-52 md:h-64' e o aspect-video por uma proporção mais alta e flexível para evitar cortes */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] md:h-80 w-full rounded-3xl overflow-hidden shadow-xs border bg-black group">
            
            {/* Wrapper dos Banners */}
            <div className="w-full h-full relative">
              {anuncios.map((ad, index) => (
                <div
                  key={ad.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                    index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  {/* CAMADA DE FUNDO (A mágica do Blur): Pega a imagem, distorce e borra para preencher as laterais vazias */}
                  <img src={ad.image} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110" />

                  {/* CAMADA PRINCIPAL (A foto da fachada INTEIRA): object-contain garante que nada seja cortado */}
                  <img src={ad.image} alt={ad.title} className="relative z-10 w-full h-full object-contain object-center animate-fade-in" />
                  
                  {/* Gradiente Escuro e Título Centralizado */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-6 text-center z-20">
                    <h2 className="text-white font-black text-base md:text-2xl uppercase tracking-wide drop-shadow-lg max-w-xl leading-tight">
                      {ad.title}
                    </h2>
                  </div>
                </div>
              ))}
            </div>

            {/* Indicadores (Dots) */}
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
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${categoriaAtiva === 'Todos' ? 'bg-amber-500 text-white' : 'bg-white border text-gray-400'}`}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setCategoriaAtiva(cat.nome)} 
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${categoriaAtiva === cat.nome ? 'bg-amber-500 text-white' : 'bg-white border text-gray-400'}`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </nav>

      {/* LISTA DE PRODUTOS */}
      <main className="max-w-5xl mx-auto px-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {produtosFiltrados.map(prod => (
            <div key={prod.id} className="bg-white border p-5 rounded-3xl flex flex-col justify-between shadow-xs">
              <div className="flex flex-col space-y-4">
                <div className="w-full h-48 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border shrink-0">
                  {prod.image_url ? (
                    <img src={prod.image_url} alt={prod.nome} className="w-full h-full object-cover object-center" />
                  ) : (
                    <div className="text-4xl opacity-40">🍔</div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-gray-900 uppercase text-base">{prod.nome}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{prod.descricao || 'Sem descrição.'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
                <div className="font-black text-amber-500 text-base">R$ {prod.preco.toFixed(2)}</div>
                <button onClick={() => setProdutoModal(prod)} className="bg-amber-500 text-white font-black text-xs px-5 py-2.5 rounded-xl uppercase hover:bg-amber-600 transition-colors">
                  Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL DETALHES */}
      {produtoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col animate-zoom-in">
            <button 
              onClick={() => setProdutoModal(null)} 
              className="absolute top-4 right-4 bg-white/80 hover:bg-white w-8 h-8 rounded-full flex items-center justify-center font-black z-30 shadow-sm"
            >
              ✕
            </button>
            
            <div className="w-full h-64 bg-black flex items-center justify-center border-b shrink-0 relative overflow-hidden">
              {produtoModal.image_url ? (
                <>
                  <img src={produtoModal.image_url} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110 z-0" />
                  <img src={produtoModal.image_url} alt={produtoModal.nome} className="relative z-10 w-full h-full object-contain object-center" />
                </>
              ) : (
                <div className="text-6xl opacity-30 text-white">🍔</div>
              )}
            </div>

            <div className="p-6 relative z-10">
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                {produtoModal.categoria}
              </span>
              <h2 className="text-xl font-black mt-2 text-gray-950 uppercase">{produtoModal.nome}</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{produtoModal.descricao || 'Este item não possui descrição detalhada.'}</p>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <span className="text-xs text-gray-400 font-bold uppercase">Preço unitário</span>
                <span className="text-xl font-black text-amber-500">R$ {produtoModal.preco.toFixed(2)}</span>
              </div>

              <button 
                onClick={() => setProdutoModal(null)} 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl mt-6 transition-colors uppercase tracking-wider text-xs"
              >
                Voltar ao Cardápio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}