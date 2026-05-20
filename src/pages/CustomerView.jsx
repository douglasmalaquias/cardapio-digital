import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import AdCard from '../components/customer/AdCard';
import ProductCard from '../components/customer/ProductCard';
import ProductModal from '../components/customer/ProductModal';

export default function CustomerView() {
  const { slug } = useParams(); // Captura o restaurante atual pela URL
  const [produtos, setProdutos] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estabelecimento, setEstabelecimento] = useState(null);

  const categorias = ['Todos', 'Lanches', 'Bebidas', 'Sobremesas'];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. Busca o estabelecimento pelo slug da URL
        const { data: estData, error: estError } = await supabase
          .from('estabelecimentos')
          .select('*')
          .eq('slug', slug)
          .single();

        if (estError || !estData) {
          console.error("Estabelecimento não encontrado ou erro na busca:", estError);
          setLoading(false);
          return;
        }

        setEstabelecimento(estData);

        // 2. Busca apenas os produtos ATIVOS atrelados a este estabelecimento
        const { data: prodData, error: prodError } = await supabase
          .from('produtos')
          .select('*')
          .eq('estabelecimento_id', estData.id)
          .eq('ativo', true); // <-- FILTRO DE DISPONIBILIDADE ATIVADO

        if (prodError) throw prodError;
        setProdutos(prodData || []);

        // 3. Busca os anúncios cadastrados (Gatilho Patrocinado)
        const { data: adsData, error: adsError } = await supabase
          .from('anuncios')
          .select('*')
          .eq('ativo', true);

        if (adsError) throw adsError;
        setAnuncios(adsData || []);

      } catch (error) {
        console.error("Erro geral ao carregar dados do cardápio:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Função disparada ao clicar em um produto para carregar seus complementos antes de abrir o modal
  const handleSelecionarProduto = async (produto) => {
    try {
      // Busca os adicionais vinculados ao ID deste produto
      const { data: complementosData, error } = await supabase
        .from('produto_complementos')
        .select('*')
        .eq('produto_id', produto.id);

      if (error) throw error;

      // Injeta os complementos encontrados dentro do objeto do produto antes de abrir o modal
      setProdutoSelecionado({
        ...produto,
        complementos: complementosData || []
      });
    } catch (error) {
      console.error("Erro ao carregar complementos do produto:", error);
      // Se der erro nos complementos, abre o modal apenas com o produto básico para não travar a experiência
      setProdutoSelecionado({ ...produto, complementos: [] });
    }
  };

  // Filtra os produtos na tela com base na categoria ativa selecionada
  const produtosFiltrados = categoriaAtiva === 'Todos'
    ? produtos
    : produtos.filter(p => p.categoria?.toLowerCase() === categoriaAtiva.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Carregando cardápio digital...</p>
      </div>
    );
  }

  if (!estabelecimento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500 font-semibold">404 - Estabelecimento não cadastrado no sistema.</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* 🥞 1. BANNER DO TOPO & IDENTIFICAÇÃO DO ESTABELECIMENTO */}
      <div className="bg-white shadow-sm border-b border-gray-100 py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          {estabelecimento.logo_url && (
            <img 
              src={estabelecimento.logo_url} 
              alt={`Logo ${estabelecimento.nome}`} 
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{estabelecimento.nome}</h1>
            <p className="text-sm text-gray-400">Cardápio Interativo via Tablet</p>
          </div>
        </div>
      </div>

      {/* 📢 BANNER DE PROPAGANDA PATROCINADA */}
      {anuncios.length > 0 && (
        <div className="max-w-6xl mx-auto mt-6 px-4">
          {anuncios.map(anuncio => (
            <AdCard key={anuncio.id} anuncio={anuncio} />
          ))}
        </div>
      )}

      {/* 🏷️ 2. NAVEGAÇÃO DE CATEGORIAS */}
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="flex gap-2 flex-wrap pb-2 items-center">
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

      {/* 🍔 3. LISTAGEM DE PRODUTOS FILTRADOS */}
      <div className="max-w-6xl mx-auto mt-6 px-4">
        {produtosFiltrados.length === 0 ? (
          <p className="text-gray-400 text-center py-12">Nenhum item disponível nesta categoria.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtosFiltrados.map(produto => (
              <ProductCard
                key={produto.id}
                produto={produto}
                onSelect={() => handleSelecionarProduto(produto)} // <-- Dispara a busca com adicionais
              />
            ))}
          </div>
        )}
      </div>

      {/* 🔎 MODAL DE DETALHES DO PRODUTO (Exibirá a lista de adicionais se houver) */}
      {produtoSelecionado && (
        <ProductModal
          produto={produtoSelecionado}
          onClose={() => setProdutoSelecionado(null)}
        />
      )}
    </div>
  );
}