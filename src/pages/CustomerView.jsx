import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AdCard from '../components/customer/AdCard';
import ProductCard from '../components/customer/ProductCard';
import ProductModal from '../components/customer/ProductModal';

export default function CustomerView() {
  const [produtos, setProdutos] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  const categorias = ['Todos', 'Lanches', 'Bebidas', 'Sobremesas'];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 1. Busca os produtos do Supabase
        const { data: produtosData, error: prodError } = await supabase
          .from('produtos')
          .select('*');
          
        // 2. Busca os anúncios ativos limitados a exatos 2
        const { data: anunciosData, error: advError } = await supabase
          .from('anuncios')
          .select('*')
          .eq('active', true)
          .limit(2);

        if (prodError) throw prodError;
        if (advError) throw advError;

        setProdutos(produtosData || []);
        setAnuncios(anunciosData || []);
      } catch (error) {
        console.error('Erro ao buscar dados do banco:', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filtra os produtos com base na categoria ativa
  const produtosFiltrados = categoriaAtiva === 'Todos'
    ? produtos
    : produtos.filter(p => p.categoria === categoriaAtiva);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-amber-600 animate-pulse">Carregando cardápio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* 📺 1. SEÇÃO DE ANÚNCIOS (Apenas renderiza se houver anúncios ativos) */}
      {anuncios.length > 0 && (
        <div className="max-w-6xl mx-auto mt-6 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anuncios.map(anuncio => (
              <div key={anuncio.id} className="w-full flex">
                <AdCard skind="ad" anuncio={anuncio} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🏷️ 2. NAVEGAÇÃO DE CATEGORIAS */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="flex gap-2 flex-nowrap overflow-x-auto pl-4 pr-4 pb-2 items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                categoriaAtiva === cat
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
          {/* Espaçador invisível de segurança */}
          <div className="w-6 flex-shrink-0" aria-hidden="true"></div>
        </div>
      </div>

      {/* 🍔 3. LISTAGEM DE PRODUTOS */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-between mb-6 gap-2">
          <h2 className="text-2xl font-black text-gray-800">{categoriaAtiva}</h2>
          <span className="text-gray-500 font-medium bg-gray-200 px-3 py-1 rounded-full text-sm">
            {produtosFiltrados.length} itens
          </span>
        </div>
        
        {produtosFiltrados.length === 0 ? (
          <div className="w-full bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-gray-500 font-medium">Nenhum produto cadastrado nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtosFiltrados.map(prod => (
              <ProductCard 
                key={prod.id} 
                produto={{
                  id: prod.id,
                  nome: prod.nome,
                  preco: prod.preco,
                  categoria: prod.categoria,
                  description: prod.descricao,
                  image: prod.imagem_url,
                  nutrition: prod.info_nutricional
                }} 
                onVerDetalhes={setProdutoSelecionado} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de Detalhes do Produto */}
      {produtoSelecionado && (
        <ProductModal 
          produto={produtoSelecionado} 
          onClose={() => setProdutoSelecionado(null)} 
        />
      )}
    </div>
  );
}