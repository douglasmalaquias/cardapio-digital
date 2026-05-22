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

  // Controle de Edição
  const [editandoId, setEditandoId] = useState(null);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate('/login');
      else setCheckingAuth(false);
    });
  }, [navigate]);

  useEffect(() => {
    if (checkingAuth) return;

    async function carregarDados() {
      try {
        setLoading(true);
        const { data: estData } = await supabase.from('estabelecimentos').select('*').eq('slug', slug).single();
        if (!estData) return navigate('/');
        setEstabelecimento(estData);

        const { data: catData } = await supabase.from('categorias').select('*').eq('estabelecimento_id', estData.id).order('nome');
        setCategorias(catData || []);
        if (catData && catData.length > 0) setCategoriaSelecionada(catData[0].nome);

        const { data: prodData } = await supabase.from('produtos').select('*').eq('estabelecimento_id', estData.id).order('nome');
        setProdutos(prodData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [slug, checkingAuth, navigate]);

  // Função para limpar o formulário
  function resetarFormulario() {
    setEditandoId(null);
    setNome('');
    setPreco('');
    setDescricao('');
    setImageUrl('');
    setImagemArquivo(null);
    if (categorias.length > 0) setCategoriaSelecionada(categorias[0].nome);
  }

  // Preparar o formulário para edição
  function handleEditarClick(produto) {
    setEditandoId(produto.id);
    setNome(produto.nome);
    setPreco(produto.preco);
    setDescricao(produto.descricao || '');
    setImageUrl(produto.image_url || '');
    setCategoriaSelecionada(produto.categoria);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola a página para cima
  }

  // Excluir produto
  async function handleExcluirClick(id) {
    if (!window.confirm('Tem certeza que deseja excluir este produto do cardápio?')) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      
      // Atualiza a lista na tela removendo o item apagado
      setProdutos(produtos.filter(p => p.id !== id));
      alert('Produto excluído com sucesso.');
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Cadastrar OU Atualizar Produto
  async function handleSalvarProduto(e) {
    e.preventDefault();
    if (!nome || !preco) return alert('Nome e Preço são obrigatórios!');

    try {
      setUploading(true);
      let finalImageUrl = imageUrl;

      // Se enviou arquivo local novo
      if (imagemArquivo) {
        const filePath = `produtos/${estabelecimento.id}/${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('imagens').upload(filePath, imagemArquivo);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('imagens').getPublicUrl(filePath);
        finalImageUrl = data.publicUrl;
      }

      const dadosProduto = {
        estabelecimento_id: estabelecimento.id,
        nome,
        preco: parseFloat(preco),
        descricao,
        image_url: finalImageUrl,
        categoria: categoriaSelecionada,
        ativo: true
      };

      if (editandoId) {
        // MODO EDIÇÃO (Update)
        const { error: updateError } = await supabase.from('produtos').update(dadosProduto).eq('id', editandoId);
        if (updateError) throw updateError;
        alert('Produto atualizado com sucesso!');
      } else {
        // MODO CRIAÇÃO (Insert)
        const { error: insertError } = await supabase.from('produtos').insert([dadosProduto]);
        if (insertError) throw insertError;
        alert('Produto cadastrado com sucesso!');
      }

      resetarFormulario();
      
      // Recarrega a lista atualizada
      const { data: prods } = await supabase.from('produtos').select('*').eq('estabelecimento_id', estabelecimento.id).order('nome');
      setProdutos(prods || []);
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  if (checkingAuth || loading) return <div className="p-6 font-medium text-gray-500">Sincronizando painel...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <button onClick={() => navigate('/')} className="text-sm text-amber-600 font-bold hover:underline mb-1">
            ← Voltar ao Hub
          </button>
          <h1 className="text-2xl font-black">Gestão de {estabelecimento.nome}</h1>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <form onSubmit={handleSalvarProduto} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border mb-8">
        <h2 className="text-sm font-bold text-amber-600 uppercase mb-4">
          {editandoId ? '✏️ Editando Produto' : '➕ Cadastrar Novo Produto'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Nome do Produto" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
          <input type="number" step="0.01" placeholder="Preço (Ex: 29.90)" value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
          <select value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 bg-white">
            {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
          </select>
        </div>
        
        <input type="text" placeholder="Descrição (ingredientes, detalhes...)" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-dashed">
          <div>
            <label className="block text-xs font-bold mb-1">Upload de Imagem Local</label>
            <input type="file" onChange={(e) => { setImagemArquivo(e.target.files[0] || null); setImageUrl(''); }} className="text-sm cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Link de Imagem (URL)</label>
            <input type="text" value={imageUrl} disabled={!!imagemArquivo} onChange={(e) => setImageUrl(e.target.value)} className="w-full border p-2 rounded-xl outline-none disabled:opacity-40" placeholder="https://..." />
          </div>
        </div>
        
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={uploading} className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold flex-1 md:flex-none transition-colors">
            {uploading ? 'Processando...' : (editandoId ? 'Atualizar Produto' : 'Salvar Novo Produto')}
          </button>
          
          {editandoId && (
            <button type="button" onClick={resetarFormulario} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold transition-colors">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* TABELA DE PRODUTOS */}
      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Produto</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Categoria</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Preço</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {produtos.map(prod => (
              <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-gray-900">{prod.nome}</div>
                </td>
                <td className="p-4 text-sm text-gray-500 font-medium">{prod.categoria}</td>
                <td className="p-4 font-black text-amber-600">R$ {prod.preco.toFixed(2)}</td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => handleEditarClick(prod)} 
                    className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleExcluirClick(prod.id)} 
                    className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {produtos.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-400">Nenhum produto cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
