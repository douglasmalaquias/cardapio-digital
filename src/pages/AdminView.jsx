import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminView() {
  const { slug } = useParams();
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idSendoEditado, setIdSendoEditado] = useState(null);

  // Estados para gerenciar a Janela de Adicionais
  const [produtoParaComplementos, setProdutoParaComplementos] = useState(null);
  const [complementos, setComplementos] = useState([]);
  const [formComplemento, setFormComplemento] = useState({ nome: '', preco: '' });

  const [form, setForm] = useState({
    nome: '',
    preco: '',
    categoria: 'Lanches',
    descricao: '',
    imagem: '',
    ativo: true
  });

  const categorias = ['Lanches', 'Bebidas', 'Sobremesas'];

  // 1. Carrega as informações do Estabelecimento
  useEffect(() => {
    async function carregarEstabelecimento() {
      try {
        const { data, error } = await supabase
          .from('estabelecimentos')
          .select('id')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        if (data) setEstabelecimentoId(data.id);
      } catch (error) {
        console.error('Erro ao buscar estabelecimento no painel de produtos:', error.message);
      }
    }
    if (slug) carregarEstabelecimento();
  }, [slug]);

  // 2. Carrega os produtos deste estabelecimento específico
  async function carregarProdutos() {
    if (!estabelecimentoId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('estabelecimento_id', estabelecimentoId)
        .order('id', { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      alert('Erro ao carregar produtos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, [estabelecimentoId]);

  // Carrega os complementos do produto selecionado
  async function carregarComplementos(produtoId) {
    try {
      const { data, error } = await supabase
        .from('produto_complementos')
        .select('*')
        .eq('produto_id', produtoId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComplementos(data || []);
    } catch (error) {
      console.error('Erro ao buscar complementos:', error.message);
    }
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleUploadImagem = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `produtos-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('imagens-produtos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('imagens-produtos')
        .getPublicUrl(fileName);

      setForm((prev) => ({ ...prev, imagem: data.publicUrl }));
      alert('Imagem do produto enviada com sucesso!');
    } catch (error) {
      alert('Erro no upload da imagem: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.preco) return alert('Nome e Preço são obrigatórios!');
    if (!estabelecimentoId) return alert('Erro: Estabelecimento não identificado.');

    try {
      const payload = {
        nome: form.nome,
        preco: parseFloat(form.preco),
        categoria: form.categoria,
        descricao: form.descricao,
        imagem: form.imagem,
        ativo: form.ativo,
        estabelecimento_id: estabelecimentoId
      };

      if (modoEdicao) {
        const { error } = await supabase
          .from('produtos')
          .update(payload)
          .eq('id', idSendoEditado);

        if (error) throw error;
        alert('Produto updated!');
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert([payload]);

        if (error) throw error;
        alert('Produto criado com sucesso!');
      }

      limparFormulario();
      carregarProdutos();
    } catch (error) {
      alert('Erro ao salvar produto: ' + error.message);
    }
  };

  const iniciarEdicao = (produto) => {
    setModoEdicao(true);
    setIdSendoEditado(produto.id);
    setForm({
      nome: produto.nome || '',
      preco: produto.preco || '',
      categoria: produto.categoria || 'Lanches',
      descricao: produto.descricao || '',
      imagem: produto.imagem || '',
      ativo: produto.ativo ?? true
    });
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Excluir este produto permanentemente?')) return;
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      alert('Produto removido!');
      carregarProdutos();
    } catch (error) {
      alert('Erro ao deletar produto: ' + error.message);
    }
  };

  const limparFormulario = () => {
    setModoEdicao(false);
    setIdSendoEditado(null);
    setForm({ nome: '', preco: '', categoria: 'Lanches', descricao: '', imagem: '', ativo: true });
  };

  const handleCriarComplemento = async (e) => {
    e.preventDefault();
    if (!formComplemento.nome || !formComplemento.preco) return alert('Insira o nome e o preço do adicional!');

    try {
      const { error } = await supabase
        .from('produto_complementos')
        .insert([{
          produto_id: produtoParaComplementos.id,
          nome: formComplemento.nome,
          preco: parseFloat(formComplemento.preco)
        }]);

      if (error) throw error;
      setFormComplemento({ nome: '', preco: '' });
      carregarComplementos(produtoParaComplementos.id);
    } catch (error) {
      alert('Erro ao salvar adicional: ' + error.message);
    }
  };

  const handleDeletarComplemento = async (id) => {
    try {
      const { error } = await supabase.from('produto_complementos').delete().eq('id', id);
      if (error) throw error;
      carregarComplementos(produtoParaComplementos.id);
    } catch (error) {
      alert('Erro ao remover adicional: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gerenciar Cardápio / Produtos</h1>

        {/* Formulário de Cadastro/Edição */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {modoEdicao ? 'Editar Produto' : 'Adicionar Novo Item ao Cardápio'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2"
                  placeholder="Ex: Burger Triplo Bacon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="preco"
                  value={form.preco}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
                >
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Produto (PNG/JPG)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImagem}
                  disabled={uploading}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-amber-50 file:text-amber-700 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição dos Ingredientes</label>
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-xl px-4 py-2"
                placeholder="Ex: Pão australiano, 3 blends de 150g..."
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                name="ativo"
                id="ativo"
                checked={form.ativo}
                onChange={handleChange}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="ativo" className="text-sm font-medium text-gray-700 select-none">
                Item disponível para pedidos nos tablets imediatamente
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-amber-500 text-white font-medium px-6 py-2 rounded-xl hover:bg-amber-600">
                {modoEdicao ? 'Salvar Alterações' : 'Cadastrar Produto'}
              </button>
              {modoEdicao && (
                <button type="button" onClick={limparFormulario} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Itens Cadastrados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Itens no Cardápio Atual</h2>
          </div>

          {loading ? (
            <p className="p-6 text-center text-gray-500">Buscando itens do cardápio...</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {produtos.length === 0 ? (
                <p className="p-6 text-center text-gray-400">Nenhum produto cadastrado ainda.</p>
              ) : (
                produtos.map((produto) => (
                  <div key={produto.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <img src={produto.imagem || 'https://placehold.co/100x100?text=Burger'} className="w-14 h-14 object-cover rounded-xl border" alt="" />
                      <div>
                        <h4 className="font-bold text-gray-900">{produto.nome}</h4>
                        <p className="text-xs text-gray-500 max-w-md truncate">{produto.descricao || 'Sem descrição'}</p>
                        <div className="flex gap-2 mt-1 items-center">
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            {produto.categoria}
                          </span>
                          <span className="text-xs font-bold text-gray-700">
                            R$ {parseFloat(produto.preco).toFixed(2)}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${produto.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {produto.ativo ? 'Disponível' : 'Indisponível'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <button 
                        onClick={() => {
                          setProdutoParaComplementos(produto);
                          carregarComplementos(produto.id);
                        }} 
                        className="text-amber-600 text-sm font-semibold hover:underline"
                      >
                        + Adicionais
                      </button>
                      <button onClick={() => iniciarEdicao(produto)} className="text-blue-600 text-sm font-semibold hover:underline">Editar</button>
                      <button onClick={() => handleDeletar(produto.id)} className="text-red-600 text-sm font-semibold hover:underline">Remover</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE GERENCIAMENTO DE COMPLEMENTOS */}
      {produtoParaComplementos && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Adicionais e Opcionais</h3>
                <p className="text-xs text-gray-500">Item: {produtoParaComplementos.nome}</p>
              </div>
              <button onClick={() => setProdutoParaComplementos(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">
                &times;
              </button>
            </div>

            <form onSubmit={handleCriarComplemento} className="grid grid-cols-3 gap-2 py-4 border-b bg-gray-50 p-3 mt-3 rounded-xl">
              <div className="col-span-2">
                <input 
                  type="text" 
                  placeholder="Ex: Queijo Extra"
                  value={formComplemento.nome}
                  onChange={(e) => setFormComplemento({ ...formComplemento, nome: e.target.value })}
                  className="w-full border text-sm rounded-lg px-3 py-1.5 bg-white"
                />
              </div>
              <div>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Preço R$"
                  value={formComplemento.preco}
                  onChange={(e) => setFormComplemento({ ...formComplemento, preco: e.target.value })}
                  className="w-full border text-sm rounded-lg px-3 py-1.5 bg-white"
                />
              </div>
              <div className="col-span-3 pt-1">
                <button type="submit" className="w-full bg-gray-900 text-white font-medium text-xs py-2 rounded-lg hover:bg-gray-800">
                  Vincular Adicional
                </button>
              </div>
            </form>

            <div className="overflow-y-auto flex-1 mt-4 space-y-2 pr-1">
              {complementos.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Nenhum opcional cadastrado.</p>
              ) : (
                complementos.map((comp) => (
                  <div key={comp.id} className="flex justify-between items-center bg-white border p-3 rounded-xl shadow-2xs">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{comp.nome}</p>
                      <p className="text-xs text-amber-600 font-semibold">+ R$ {parseFloat(comp.preco).toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => handleDeletarComplemento(comp.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium border border-red-100 px-2 py-1 rounded-lg"
                    >
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}