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

  // Mapeamento das cores (deve bater com os IDs do teu Admin)
  const temaOpcoes = {
    amber: { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-500' },
    red:   { bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-600' },
    blue:  { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600' },
    green: { bg: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-600' },
    black: { bg: 'bg-gray-900', hover: 'hover:bg-black', text: 'text-gray-900' }
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

  // Se o estabelecimento ainda está a carregar, evita erro
  if (loading || !estabelecimento) return <div className="text-center p-10">Carregando cardápio...</div>;

  // Define o tema baseado no que está na coluna 'tema' da tabela estabelecimentos
  const tema = temaOpcoes[estabelecimento.tema] || temaOpcoes['amber'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* HEADER DINÂMICO */}
      <header className={`${tema.bg} text-white p-6 shadow-lg`}>
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          {estabelecimento.logo_url && <img src={estabelecimento.logo_url} alt="Logo" className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover" />}
          <h1 className="text-2xl font-black">{estabelecimento.nome}</h1>
        </div>
      </header>

      {/* CATEGORIAS DINÂMICAS */}
      <nav className="max-w-3xl mx-auto p-4 flex gap-2 overflow-x-auto">
        <button onClick={() => setCategoriaAtiva('Todos')} className={`px-4 py-2 rounded-lg font-bold ${categoriaAtiva === 'Todos' ? `${tema.bg} text-white` : 'bg-white'}`}>Todos</button>
        {categorias.map(cat => (
          <button key={cat.id} onClick={() => setCategoriaAtiva(cat.nome)} className={`px-4 py-2 rounded-lg font-bold ${categoriaAtiva === cat.nome ? `${tema.bg} text-white` : 'bg-white'}`}>
            {cat.nome}
          </button>
        ))}
      </nav>

      {/* LISTA DE PRODUTOS */}
      <main className="max-w-3xl mx-auto p-4 space-y-8">
        {(categoriaAtiva === 'Todos' ? categorias : [{nome: categoriaAtiva}]).map(cat => (
          <section key={cat.nome}>
            <h2 className={`text-lg font-black uppercase mb-4 ${tema.text}`}>{cat.nome}</h2>
            <div className="grid gap-4">
              {produtos.filter(p => categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva).filter(p => p.categoria === cat.nome).map(prod => (
                <div key={prod.id} onClick={() => setProdutoModal(prod)} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4 border border-gray-100 cursor-pointer">
                  {prod.image_url && <img src={prod.image_url} alt={prod.nome} className="w-20 h-20 rounded-xl object-cover" />}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{prod.nome}</h3>
                    <p className="text-xs text-gray-500 mt-1">{prod.descricao}</p>
                    <p className={`font-black mt-2 ${tema.text}`}>R$ {prod.preco.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* MODAL (Pode manter a sua lógica original aqui) */}
    </div>
  );
}