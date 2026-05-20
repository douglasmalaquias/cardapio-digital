import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function CustomerView() {
  const { slug } = useParams();
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [categorias, setCategorias] = useState([]); // Abas dinâmicas
  const [produtos, setProdutos] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para Detalhes do Produto Selecionado
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [complementos, setComplementos] = useState([]);

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
  const abrirDetalhesProduto = async (produto) => {
    setProdutoSelecionado(produto);
    try {
      const { data, error } = await supabase
        .from('produto_complementos')
        .select('*')
        .eq('produto_id', produto.id);

      if (error) throw error;
      setComplementos(data || []);
    } catch (error) {
      console.error('Erro ao buscar adicionais:', error.message);
    }
  };

  // Filtra produtos com base na aba dinâmica selecionada
  const produtosFiltrados = produtos.filter(p => p.categoria === categoriaAtiva);

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
      <header className="bg-white border-b sticky top-0 z-40 p-4 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
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
        <div className="max-w-3xl mx-auto flex px-4 gap-2 py-3 whitespace-nowrap">
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

      {/* Grid de Produtos da Categoria Ativa */}
      <main className="max-w-3xl mx-auto p-4">
        <h2 className="text-lg font-extrabold text-gray-800 mb-4">{categoriaAtiva}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {produtosFiltrados.map((produto) => (
            <div 
              key={produto.id}
              onClick={() => abrirDetalhesProduto(produto)}
              className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs flex gap-3 cursor-pointer hover:border-amber-300 transition-all active:scale-[0.99]"
            >
              <img 
                src={produto.imagem_url || 'https://placehold.co/120x120?text=Burger'} 
                alt={produto.nome}
                className="w-24 h-24 object-cover rounded-xl border flex-shrink-0"
              />
              <div className="flex flex-col justify-between overflow-hidden">
                <div>
                  <h3 className="font-bold text-gray-900 text-base truncate">{produto.nome}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {produto.descricao || 'Sem descrição.'}
                  </p>
                </div>
                <p className="text-base font-black text-amber-600 mt-2">
                  R$ {parseFloat(produto.preco).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          {produtosFiltrados.length === 0 && (
            <p className="text-sm text-gray-400 py-8 col-span-full text-center">
              Nenhum produto cadastrado nesta categoria ainda.
            </p>
          )}
        </div>
      </main>

      {/* JANELA FLUTUANTE (MODAL) DE DETALHES */}
      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
            
            {/* Header Modal */}
            <div className="relative flex-shrink-0">
              <img 
                src={produtoSelecionado.imagem_url || 'https://placehold.co/500x300?text=Burger'} 
                className="w-full h-48 sm:h-56 object-cover"
                alt=""
              />
              <button 
                onClick={() => setProdutoSelecionado(null)}
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            {/* Corpo Modal */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">{produtoSelecionado.nome}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{produtoSelecionado.descricao}</p>
              </div>

              {/* Seção Opcionais */}
              {complementos.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                    Adicionar ao Item
                  </h4>
                  <div className="space-y-2">
                    {complementos.map(comp => (
                      <div key={comp.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{comp.nome}</p>
                          <p className="text-xs text-amber-600 font-bold">+ R$ {parseFloat(comp.preco).toFixed(2)}</p>
                        </div>
                        <button className="bg-amber-500 text-white font-extrabold text-sm px-3 py-1 rounded-lg">
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Subtotal</p>
                <p className="text-xl font-black text-amber-600">
                  R$ {parseFloat(produtoSelecionado.preco).toFixed(2)}
                </p>
              </div>
              <button 
                onClick={() => {
                  alert('Funcionalidade de carrinho vindo por aí!');
                  setProdutoSelecionado(null);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl shadow-xs text-sm"
              >
                Adicionar ao Pedido
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}