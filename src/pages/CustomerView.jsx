import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ProductCard from '../components/customer/ProductCard';
import ProductModal from '../components/customer/ProductModal';

export default function CustomerView() {
  const { slug } = useParams();
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [categorias, setCategorias] = useState([]); 
  const [produtos, setProdutos] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('');
  const [loading, setLoading] = useState(true);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        setLoading(true);
        
        // 1. Busca dados do Estabelecimento
        const { data: estData, error: estError } = await supabase
          .from('estabelecimentos')
          .select('*')
          .eq('slug', slug)
          .single();

        if (estError) throw estError;
        setEstabelecimento(estData);

        if (estData) {
          // 2. Busca Categorias Dinâmicas
          const { data: catData, error: catError } = await supabase
            .from('categorias')
            .select('*')
            .eq('estabelecimento_id', estData.id)
            .order('nome', { ascending: true });

          if (catError) throw catError;
          setCategorias(catData || []);
          
          if (catData && catData.length > 0) {
            setCategoriaAtiva(catData[0].nome);
          }

          // 3. Busca Produtos Ativos
          const { data: prodData, error: prodError } = await supabase
            .from('produtos')
            .select('*')
            .eq('estabelecimento_id', estData.id)
            .eq('ativo', true);

          if (prodError) throw prodError;
          setProdutos(prodData || []);
        }
      } catch (error) {
        console.error('Erro ao renderizar o cardápio:', error.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug) carregarDadosIniciais();
  }, [slug]);

  // Carrega opcionais ao abrir a janela flutuante de um produto
  const handleSelecionarProduto = async (produto) => {
    try {
      const { data: complementosData, error } = await supabase
        .from('produto_complementos')
        .select('*')
        .eq('produto_id', produto.id);

      if (error) throw error;

      setProdutoSelecionado({
        ...produto,
        complementos: complementosData || []
      });
    } catch (error) {
      console.error('Erro ao buscar adicionais:', error.message);
      setProdutoSelecionado({ ...produto, complementos: [] });
    }
  };

  // Filtra produtos com base na aba dinâmica selecionada
  const produtosFiltrados = produtos.filter(p => p.categoria?.toLowerCase() === categoriaAtiva?.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 font-medium">Carregando cardápio digital...</p>
      </div>
    );
  }

  if (!estabelecimento) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-500 font-bold">Estabelecimento não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-28">
      {/* Cabeçalho */}
      <header className="bg-white border-b sticky top-0 z-40 p-4 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900 uppercase">
              {estabelecimento.nome}
            </h1>
            <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Tablet Conectado / Autoatendimento
            </p>
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600">
            Mesa 04
          </div>
        </div>
      </header>

      {/* Categorias Dinâmicas (Navegação por Abas) */}
      <nav className="bg-white border-b sticky top-[69px] z-30 overflow-x-auto scrollbar-none">
        <div className="max-w-6xl mx-auto flex px-4 gap-2 py-3 whitespace-nowrap">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.nome)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                categoriaAtiva === cat.nome
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </nav>

      {/* Grid de Produtos da Categoria Ativa usando o Componente Oficial */}
      <main className="max-w-6xl mx-auto p-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtosFiltrados.map((produto) => (
            <ProductCard 
              key={produto.id}
              produto={produto}
              onSelect={handleSelecionarProduto}
            />
          ))}

          {produtosFiltrados.length === 0 && (
            <p className="text-sm text-gray-400 py-12 col-span-full text-center">
              Nenhum produto cadastrado nesta categoria ainda.
            </p>
          )}
        </div>
      </main>

      {/* JANELA FLUTUANTE (MODAL) DE DETALHES */}
      {produtoSelecionado && (
        <ProductModal
          produto={produtoSelecionado}
          onClose={() => setProdutoSelecionado(null)}
        />
      )}
    </div>
  );
}