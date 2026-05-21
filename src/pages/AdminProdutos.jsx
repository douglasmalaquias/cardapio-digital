import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminProdutos() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  useEffect(() => {
    async function verificarSessao() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/login');
      else setCheckingAuth(false);
    }
    verificarSessao();
  }, [navigate]);

  useEffect(() => {
    if (checkingAuth) return;

    async function carregarDados() {
      try {
        setLoading(true);
        const { data: estData, error: estError } = await supabase
          .from('estabelecimentos')
          .select('*')
          .eq('slug', slug)
          .single();

        if (estError || !estData) {
          alert('Estabelecimento não encontrado!');
          navigate('/');
          return;
        }
        setEstabelecimento(estData);

        const { data: catData } = await supabase
          .from('categorias')
          .select('*')
          .eq('estabelecimento_id', estData.id)
          .order('nome');
        
        setCategorias(catData || []);
        if (catData && catData.length > 0) {
          setCategoriaSelecionada(catData[0].nome);
        }

        const { data: prodData } = await supabase
          .from('produtos')
          .select('*')
          .eq('estabelecimento_id', estData.id)
          .order('nome');

        setProdutos(prodData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [slug, checkingAuth, navigate]);

  async function handleCadastrarProduto(e) {
    e.preventDefault();
    if (!nome || !preco) return alert('Nome e Preço são obrigatórios!');

    try {
      setUploading(true);
      let finalImageUrl = imageUrl;

      // Se houver arquivo local, faz o upload para o Storage primeiro
      if (imagemArquivo) {
        const fileExt = imagemArquivo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `produtos/${estabelecimento.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('imagens')
          .upload(filePath, imagemArquivo);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('imagens').getPublicUrl(filePath);
        finalImageUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase.from('produtos').insert([
        {
          estabelecimento_id: estabelecimento.id,
          nome,
          preco: parseFloat(preco),
          descricao: descricao || null,
          image_url: finalImageUrl || null, 
          categoria: categoriaSelecionada,
          ativo: true
        }
      ]);

      if (insertError) throw insertError;

      alert('Produto cadastrado com sucesso!');
      setNome('');
      setPreco('');
      setDescricao('');
      setImageUrl('');
      setImagemArquivo(null);
      
      if (document.getElementById('fileInput')) {
        document.getElementById('fileInput').value = '';
      }

      const { data: prodData } = await supabase
        .from('produtos')
        .select('*')
        .eq('estabelecimento_id', estabelecimento.id)
        .order('nome');
      setProdutos(prodData || []);

    } catch (error) {
      alert('Erro ao cadastrar: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  if (checkingAuth || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 font-medium">Carregando painel do lojista...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <button onClick={() => navigate('/')} className="text-sm text-amber-600 font-bold hover:underline mb-1 block">
              ← Voltar ao Hub Central
            </button>
            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
              Gestão de Produtos - {estabelecimento.nome}
            </h1>
          </div>
          <a href={`/${slug}`} target="_blank" rel="noreferrer" className="bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xs hover:bg-amber-600 transition-all">
            Ver Cardápio Público ↗
          </a>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xs border mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            Cadastrar Novo Item no Menu
          </h2>
          <form onSubmit={handleCadastrarProduto} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nome do Produto</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ex: Burger Duplo Artesanal" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Preço (R$)</label>
                <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ex: 34.90" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Categoria</label>
                <select value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500">
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                  ))}
                  {categorias.length === 0 && <option value="">Nenhuma categoria encontrada</option>}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Descrição dos Ingredientes</label>
              <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ex: Pão brioche, 2x blends de 150g..." />
            </div>

            {/* SELEÇÃO DUPLA DE IMAGEM */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-dashed grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Opção A: Upload de Foto Local</label>
                <input 
                  id="fileInput"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setImagemArquivo(e.target.files[0]);
                      setImageUrl(''); // Limpa o link de texto para priorizar o arquivo
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Opção B: Link de Imagem (URL)</label>
                <input 
                  type="text" 
                  value={imageUrl} 
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (e.target.value && document.getElementById('fileInput')) {
                      setImagemArquivo(null); // Limpa o arquivo se digitou uma URL
                      document.getElementById('fileInput').value = '';
                    }
                  }} 
                  className="w-full border border-gray-300 bg-white rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-amber-500" 
                  placeholder="https://site.com/foto-produto.jpg" 
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={uploading} className="bg-gray-900 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
                {uploading ? 'Salvando item...' : 'Salvar Produto'}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Produtos */}
        <div className="bg-white rounded-3xl shadow-xs border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase w-20">Foto</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">Produto</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">Categoria</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">Preço</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {produtos.map(prod => (
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.nome} className="w-12 h-12 rounded-xl object-cover border" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl border border-dashed bg-gray-50 flex items-center justify-center text-xl">🍔</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{prod.nome}</div>
                    <div className="text-xs text-gray-400 line-clamp-1">{prod.descricao || 'Sem descrição.'}</div>
                  </td>
                  <td className="p-4 text-sm font-semibold text-gray-500">{prod.categoria}</td>
                  <td className="p-4 text-sm font-bold text-gray-800">R$ {prod.preco.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
