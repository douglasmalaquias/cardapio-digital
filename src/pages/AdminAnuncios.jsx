import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminAnuncios() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [estabelecimento, setEstabelecimento] = useState(null);
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Campos do formulário
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);

  // 1. Verificar Sessão (Segurança)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate('/login');
      else setCheckingAuth(false);
    });
  }, [navigate]);

  // 2. Carregar Dados do Estabelecimento e Anúncios Existentes
  useEffect(() => {
    if (checkingAuth) return;

    async function carregarDados() {
      try {
        setLoading(true);
        
        // Busca o estabelecimento para pegar o ID correto (Evita quebra de Foreign Key)
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

        // Busca os anúncios vinculados a este ID
        const { data: adsData } = await supabase
          .from('anuncios')
          .select('*')
          .eq('estabelecimento_id', estData.id);

        setAnuncios(adsData || []);
      } catch (err) {
        console.error('Erro ao carregar anúncios:', err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [slug, checkingAuth, navigate]);

  // 3. Cadastrar Novo Anúncio
  async function handleCadastrarAnuncio(e) {
    e.preventDefault();
    if (!title) return alert('O título do anúncio é obrigatório!');
    if (!imagemArquivo && !imageUrl) return alert('Insira uma imagem por upload ou link URL!');
    if (!estabelecimento?.id) return alert('Erro de infraestrutura: ID do estabelecimento não carregado.');

    try {
      setUploading(true);
      let finalImageUrl = imageUrl;

      // Se houver arquivo de imagem local selecionado
      if (imagemArquivo) {
        const fileExt = imagemArquivo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `anuncios/${estabelecimento.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('imagens')
          .upload(filePath, imagemArquivo);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('imagens').getPublicUrl(filePath);
        finalImageUrl = data.publicUrl;
      }

      // INSERT garantindo que o estabelecimento_id correto está sendo injetado
      const { error: insertError } = await supabase.from('anuncios').insert([
        {
          estabelecimento_id: estabelecimento.id, // Chave estrangeira obrigatória
          title: title,
          image: finalImageUrl,
          active: true
        }
      ]);

      if (insertError) throw insertError;

      alert('Anúncio cadastrado com sucesso!');
      
      // Reseta o formulário
      setTitle('');
      setImageUrl('');
      setImagemArquivo(null);
      if (document.getElementById('fileInput')) {
        document.getElementById('fileInput').value = '';
      }

      // Recarrega a listagem atualizada
      const { data: adsData } = await supabase
        .from('anuncios')
        .select('*')
        .eq('estabelecimento_id', estabelecimento.id);
      setAnuncios(adsData || []);

    } catch (error) {
      alert('Erro ao salvar anúncio: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  // 4. Excluir Anúncio
  async function handleExcluirAnuncio(id) {
    if (!window.confirm('Deseja realmente excluir este banner de anúncio?')) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('anuncios').delete().eq('id', id);
      if (error) throw error;
      
      setAnuncios(anuncios.filter(ad => ad.id !== id));
      alert('Anúncio removido!');
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth || loading) return <div className="p-6 font-medium text-gray-500">Sincronizando painel de anúncios...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans text-gray-900">
      
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="text-sm text-amber-600 font-bold hover:underline mb-1">
          ← Voltar ao Hub
        </button>
        <h1 className="text-2xl font-black">Gestão de Banners / Anúncios - {estabelecimento.nome}</h1>
      </div>

      {/* FORMULÁRIO */}
      <form onSubmit={handleCadastrarAnuncio} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border mb-8">
        <h2 className="text-sm font-bold text-amber-600 uppercase mb-2">🚀 Criar Novo Banner de Destaque</h2>
        
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Título / Nome do Banner</label>
          <input 
            type="text" 
            placeholder="Ex: Combo de Inauguração - 20% OFF" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 bg-white" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-dashed">
          <div>
            <label className="block text-xs font-bold mb-1 uppercase text-gray-600">Opção A: Upload de Foto Local</label>
            <input 
              id="fileInput" 
              type="file" 
              accept="image/*" 
              onChange={(e) => { setImagemArquivo(e.target.files[0] || null); setImageUrl(''); }} 
              className="text-sm cursor-pointer mt-1" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 uppercase text-gray-600">Opção B: Link de Imagem (URL)</label>
            <input 
              type="text" 
              value={imageUrl} 
              disabled={!!imagemArquivo} 
              onChange={(e) => setImageUrl(e.target.value)} 
              className="w-full border border-gray-300 p-2.5 rounded-xl outline-none bg-white disabled:opacity-40 mt-1" 
              placeholder="https://..." 
            />
          </div>
        </div>

        <button type="submit" disabled={uploading} className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold transition-colors cursor-pointer">
          {uploading ? 'Enviando banner...' : 'Publicar Anúncio'}
        </button>
      </form>

      {/* LISTA DE ANÚNCIOS ATIVOS */}
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Banners Ativos no Cardápio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {anuncios.map(ad => (
          <div key={ad.id} className="bg-white border rounded-3xl p-4 flex gap-4 items-center shadow-sm justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <img src={ad.image} alt={ad.title} className="w-20 h-14 rounded-xl object-cover border" />
              <div className="font-bold text-gray-900 truncate pr-2">{ad.title}</div>
            </div>
            <button 
              onClick={() => handleExcluirAnuncio(ad.id)} 
              className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors shrink-0"
            >
              Remover
            </button>
          </div>
        ))}
        {anuncios.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400 bg-white border border-dashed rounded-3xl text-sm font-medium">
            Nenhum banner ativo no momento.
          </div>
        )}
      </div>

    </div>
  );
}