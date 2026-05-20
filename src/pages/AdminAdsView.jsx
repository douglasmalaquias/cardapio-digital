import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminAdsView() {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idSendoEditado, setIdSendoEditado] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    active: true
  });

  async function carregarAnuncios() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setAnuncios(data || []);
    } catch (error) {
      alert('Erro ao carregar anúncios: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarAnuncios();
  }, []);

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
      const fileName = `banners-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('imagens-produtos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('imagens-produtos')
        .getPublicUrl(fileName);

      setForm((prev) => ({ ...prev, image: data.publicUrl }));
      alert('Banner enviado com sucesso!');
    } catch (error) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return alert('O título do anúncio é obrigatório!');

    try {
      const payload = {
        title: form.title,
        description: form.description,
        image: form.image,
        active: form.active
      };

      if (modoEdicao) {
        const { error } = await supabase
          .from('anuncios')
          .update(payload)
          .eq('id', idSendoEditado);

        if (error) throw error;
        alert('Anúncio atualizado!');
      } else {
        const { error } = await supabase
          .from('anuncios')
          .insert([payload]);

        if (error) throw error;
        alert('Anúncio criado!');
      }

      limparFormulario();
      carregarAnuncios();
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const iniciarEdicao = (anuncio) => {
    setModoEdicao(true);
    setIdSendoEditado(anuncio.id);
    setForm({
      title: anuncio.title || '',
      description: anuncio.description || '',
      image: anuncio.image || '',
      active: anuncio.active ?? true
    });
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Excluir este anúncio permanentemente?')) return;
    try {
      const { error } = await supabase.from('anuncios').delete().eq('id', id);
      if (error) throw error;
      alert('Anúncio removido!');
      carregarAnuncios();
    } catch (error) {
      alert('Erro ao deletar: ' + error.message);
    }
  };

  const limparFormulario = () => {
    setModoEdicao(false);
    setIdSendoEditado(null);
    setForm({ title: '', description: '', image: '', active: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gerenciar Banners / Anúncios</h1>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {modoEdicao ? 'Editar Banner' : 'Criar Novo Banner Promocional'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Anúncio *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2"
                  placeholder="Ex: Sabadão do Bacon: 20% OFF"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload do Banner (PNG/JPG)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto de Subtítulo / Descrição</label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2"
                placeholder="Ex: Válido na compra de qualquer combo até as 22h."
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                name="active"
                id="active"
                checked={form.active}
                onChange={handleChange}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700 select-none">
                Ativar banner imediatamente no carrossel do cliente
              </label>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="bg-amber-500 text-white font-medium px-6 py-2 rounded-xl hover:bg-amber-600">
                {modoEdicao ? 'Salvar Alterações' : 'Publicar Banner'}
              </button>
              {modoEdicao && (
                <button type="button" onClick={limparFormulario} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Banners */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Banners Ativos e Inativos</h2>
          </div>

          {loading ? (
            <p className="p-6 text-center text-gray-500">Buscando banners...</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {anuncios.map((anuncio) => (
                <div key={anuncio.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <img src={anuncio.image || 'https://placehold.co/120x80'} className="w-16 h-12 object-cover rounded-lg border" alt="" />
                    <div>
                      <h4 className="font-bold text-gray-900">{anuncio.title}</h4>
                      <p className="text-xs text-gray-500">{anuncio.description || 'Sem descrição'}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${anuncio.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {anuncio.active ? 'Visível' : 'Oculto'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => iniciarEdicao(anuncio)} className="text-blue-600 text-sm font-semibold hover:underline">Editar</button>
                    <button onClick={() => handleDeletar(anuncio.id)} className="text-red-600 text-sm font-semibold hover:underline">Remover</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}