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
  const [titulo, setTitulo] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);

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

        const { data: adsData } = await supabase
          .from('anuncios')
          .select('*')
          .eq('estabelecimento_id', estData.id);

        setAnuncios(adsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [slug, checkingAuth, navigate]);

  async function handleCadastrar(e) {
    e.preventDefault();
    if (!titulo) return alert('Insira um título interno!');
    if (!imageUrl && !imagemArquivo) return alert('Selecione uma imagem ou insira uma URL!');

    try {
      setUploading(true);
      let finalImageUrl = imageUrl;

      if (imagemArquivo) {
        const fileExt = imagemArquivo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `anuncios/${estabelecimento.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('imagens')
          .upload(filePath, imagemArquivo);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('imagens').getPublicUrl(filePath);
        finalImageUrl = data.publicUrl;
      }

      const { error } = await supabase.from('anuncios').insert([
        {
          estabelecimento_id: estabelecimento.id,
          title: titulo,
          image: finalImageUrl,
          active: true
        }
      ]);

      if (error) throw error;

      alert('Banner de anúncio adicionado!');
      setTitulo('');
      setImageUrl('');
      setImagemArquivo(null);
      document.getElementById('fileInputAd').value = '';
      
      const { data: adsData } = await supabase
        .from('anuncios')
        .select('*')
        .eq('estabelecimento_id', estabelecimento.id);
      setAnuncios(adsData || []);

    } catch (error) {
      alert('Erro ao processar anúncio: ' + error.message);
    } final {
      setUploading(false);
    }
  }

  async function handleApagar(id) {
    if (!window.confirm('Tem certeza que deseja apagar este banner?')) return;
    
    const { error } = await supabase.from('anuncios').delete().eq('id', id);
    if (error) {
      alert('Erro ao apagar: ' + error.message);
    } else {
      setAnuncios(anuncios.filter(a => a.id !== id));
    }
  }

  if (checkingAuth || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Carregando painel de anúncios...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 font-bold hover:underline mb-1 block">
              ← Voltar ao Hub Central
            </button>
            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
              Gestão de Anúncios - {estabelecimento.nome}
            </h1>
          </div>
          <a href={`/${slug}`} target="_blank" rel="noreferrer" className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xs hover:bg-gray-800 transition-all">
            Ver Telão ↗
          </a>
        </div>

        {/* Form de Cadastro */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border mb-8">
          <form onSubmit={handleCadastrar} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Título (Interno)</label>
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" placeholder="Ex: Promoção Hamburguer de Quinta" />
            </div>

            {/* BOX DUPLO IMAGEM BANNER */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-dashed grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Opção A: Upload de Banner Local</label>
                <input 
                  id="fileInputAd"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    setImagemArquivo(e.target.files[0]);
                    setImageUrl('');
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Opção B: Link do Banner (URL)</label>
                <input 
                  type="text" 
                  value={imageUrl} 
                  disabled={!!imagemArquivo}
                  onChange={(e) => setImageUrl(e.target.value)} 
                  className="w-full border rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-40" 
                  placeholder="https://site.com/banner.jpg" 
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={uploading} className="w-full md:w-auto bg-amber-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors disabled:opacity-50">
                {uploading ? 'Fazendo Upload...' : 'Adicionar Banner'}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {anuncios.map(anuncio => (
            <div key={anuncio.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm relative group">
              <img src={anuncio.image} alt={anuncio.title} className="w-full h-48 object-cover" />
              <div className="p-4 flex justify-between items-center">
                <span className="font-bold text-gray-800">{anuncio.title}</span>
                <button onClick={() => handleApagar(anuncio.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                  Apagar
                </button>
              </div>
            </div>
          ))}
          {anuncios.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 bg-white border rounded-2xl border-dashed">
              Nenhum banner ativo no momento.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
