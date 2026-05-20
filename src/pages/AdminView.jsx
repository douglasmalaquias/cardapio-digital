import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminView() {
  const { slug } = useParams();
  const [estabelecimentoId, setEstablishmentId] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idSendoEditado, setIdSendoEditado] = useState(null);

  // Estados novos para gerenciar a Janela de Adicionais
  const [produtoParaComplementos, setProdutoParaComplementos] = useState(null);
  const [complementos, setComplementos] = useState([]);
  const [formComplemento, setFormComplemento] = useState({ nome: '', preco: '' });

  const [form, setForm] = useState({
    nome: '',
    preco: '',
    categoria: 'Lanches',
    descricao: '',
    imagem: '',
    ativo: true // Campo de controle de estoque nativo
  });

  const categorias = ['Lanches', 'Bebidas', 'Sobremesas'];

  // 1. Carrega as informações do Estabelecimento primeiro
  useEffect(() => {
    async function carregarEstabelecimento() {
      try {
        const { data, error } = await supabase
          .from('estabelecimentos')
          .select('id')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        if (data) setEstablishmentId(data.id);
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
        alert('Produto atualizado!');
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

  // Funções para manipulação direta de Adicionais/Complementos
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
                placeholder="Ex: Pão australiano, 3 blends de 150g, muito bacon e queijo cheddar maçaricado."
              />
            </div>

            {/* GATILHO ON/OFF DE ESTOQUE/DISPONIBILIDADE */}
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
                {modoEdicao ? '