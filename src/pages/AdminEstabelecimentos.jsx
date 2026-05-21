import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminEstabelecimentos() {
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoNome, setNovoNome] = useState('');
  const [novoSlug, setNovoSlug] = useState('');
  const [novoLogoUrl, setNovoLogoUrl] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 1. Verificação de Segurança (Autenticação)
  useEffect(() => {
    async function verificarSessao() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      } else {
        setCheckingAuth(false);
      }
    }
    verificarSessao();
  }, [navigate]);

  // 2. Carrega a lista de estabelecimentos após validar a sessão
  useEffect(() => {
    if (checkingAuth) return;
    carregarEstabelecimentos();
  }, [checkingAuth]);

  async function carregarEstabelecimentos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('estabelecimentos')
      .select('*')
      .order('nome');
      
    if (!error) setEstabelecimentos(data || []);
    setLoading(false);
  }

  // 3. Função para salvar um novo estabelecimento no banco
  async function handleAdicionar(e) {
    e.preventDefault();
    if (!novoNome || !novoSlug) return alert('Preencha o nome e o slug!');

    try {
      setUploading(true);
      let finalLogoUrl = novoLogoUrl;

      // Se houver arquivo de imagem local selecionado, faz upload para o Storage
      if (imagemArquivo) {
        const fileExt = imagemArquivo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('imagens')
          .upload(filePath, imagemArquivo);

        if (uploadError) throw uploadError;

        // Captura a URL pública gerada no bucket do Supabase
        const { data } = supabase.storage.from('imagens').getPublicUrl(filePath);
        finalLogoUrl = data.publicUrl;
      }

      // Insere na tabela estabelecimentos
      const { error: insertError } = await supabase.from('estabelecimentos').insert([
        { 
          nome: novoNome, 
          slug: novoSlug,
          logo_url: finalLogoUrl || null
        }
      ]);

      if (insertError) throw insertError;

      alert('Estabelecimento criado com sucesso!');
      setNovoNome('');
      setNovoSlug('');
      setNovoLogoUrl('');
      setImagemArquivo(null);
      document.getElementById('fileInputLogo').value = '';
      carregarEstabelecimentos(); 

    } catch (error) {
      alert('Erro ao criar estabelecimento: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 font-medium">
        Validando credenciais de segurança...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* CABEÇALHO COM BOTÃO VOLTAR REAL */}
        <div className="mb-6">
          <button 
            type="button"
            onClick={() => navigate('/')} 
            className="text-sm text-amber-600 font-bold hover:underline mb-2 block cursor-pointer"
          >
            ← Voltar ao Hub Central
          </button>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            Gestão de Estabelecimentos
          </h1>
        </div>

        {/* Formulário para Adicionar Novo */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            Adicionar Novo Cliente
          </h2>
          <form onSubmit={handleAdicionar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nome do Mercearia / Hamburgueria</label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  placeholder="Ex: Padaria do Zé"
                />
              </div>
              
              <div className="w-full">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Slug (Link Público)</label>
                <input
                  type="text"
                  value={novoSlug}
                  onChange={(e) => setNovoSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  placeholder="Ex: padaria-do-ze"
                />
              </div>
            </div>

            {/* CAIXA DUPLA: SELEÇÃO DE ARQUIVO LOCAL OU LINK EXTERNO */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-dashed grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Opção A: Upload de Logo Local</label>
                <input 
                  id="fileInputLogo"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    setImagemArquivo(e.target.files[0]);
                    setNovoLogoUrl(''); // Limpa campo de URL para priorizar o arquivo
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Opção B: Link da Logo (URL)</label>
                <input 
                  type="text" 
                  value={novoLogoUrl} 
                  disabled={!!imagemArquivo}
                  onChange={(e) => setNovoLogoUrl(e.target.value)} 
                  className="w-full border rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-40" 
                  placeholder="https://linkdaimagem.com/logo.png" 
                />
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button 
                type="submit" 
                disabled={uploading}
                className="w-full md:w-auto bg-gray-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors text-sm disabled:opacity-50 cursor-pointer"
              >
                {uploading ? 'Salvando dados...' : 'Cadastrar Estabelecimento'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabela de Estabelecimentos Cadastrados */}
        <div className="bg-white rounded-3xl shadow-xs border overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase w-20">Logo</th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase">Nome</th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase">Link (Slug)</th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">Carregando lista...</td>
                </tr>
              ) : (
                estabelecimentos.map(est => (
                  <tr key={est.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      {est.logo_url ? (
                        <img 
                          src={est.logo_url} 
                          alt={`Logo ${est.nome}`} 
                          className="w-10 h-10 rounded-lg object-cover border bg-gray-50"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-dashed bg-gray-50 flex items-center justify-center text-lg shadow-inner">
                          🏪
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-gray-800">{est.nome}</td>
                    <td className="p-4 text-gray-500 text-sm">/{est.slug}</td>
                    <td className="p-4 text-center">
                      <a 
                        href={`/${est.slug}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-amber-600 font-bold text-sm hover:underline"
                      >
                        Ver Cardápio ↗
                      </a>
                    </td>
                  </tr>
                ))
              )}
              {estabelecimentos.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">Nenhum estabelecimento cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
