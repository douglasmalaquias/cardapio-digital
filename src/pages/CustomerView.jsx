import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Header from '../components/customer/Header';
import AdCard from '../components/customer/AdCard';
import ProductCard from '../components/customer/ProductCard';
import ProductModal from '../components/customer/ProductModal';

export default function CustomerView() {
  const [produtos, setProdutos] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  // Categorias fixas do seu cardápio
  const categorias = ['Todos', 'Lanches', 'Bebidas', 'Sobremesas'];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Busca os produtos do Supabase
        const { data: produtosData, error: prodError } = await supabase
          .from('produtos')
          .select('*');
          
        // Busca os anúncios ativos do Supabase
        const { data: anunciosData, error: advError } = await supabase
          .from('anuncios')
          .select('*')
          .eq('active', true);

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
  } [], []);

  // Filtra os produtos com base na categoria clicada
  const produtosFiltrados = categoriaAtiva === 'Todos'
    ? produtos
    : produtos.filter(p => p.categoria === categoriaAtiva);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-amber-600 animate-pulse">Carregando cardápio inovador...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      
      {/* Carrossel de Anúncios dinâmico */}
      <div className="max-w-6xl mx-auto px-4 mt-6 flex gap-4 overflow-x-auto scrollbar-hide">
        {anuncios.map(anuncio => (
          <AdCard key={anuncio.id} anuncio={anuncio} />
        ))}
      </div>

      {/* Navegação de Categorias */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                categoriaAtiva === cat
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Listagem de Produtos Dinâmicos */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{categoriaAtiva}</h2>
        
        {produtosFiltrados.length === 0 ? (
          <p className="text-gray-500">Nenhum produto cadastrado nesta categoria.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtosFiltrados.map(prod => (
              <ProductCard 
                key={prod.id} 
                produto={prod} 
                onVerDetalhes={setProdutoSelecionado} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de Detalhes do Hambúrguer */}
      {produtoSelecionado && (
        <ProductModal 
          produto={produtoSelecionado} 
          onClose={() => setProdutoSelecionado(null)} 
        />
      )}
    </div>
  );
}