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
  const [abaAtiva, setAbaAtiva] = useState('produtos');
  const [uploading, setUploading] = useState(false);

  // Estados de Configuração
  const [lojaNome, setLojaNome] = useState('');
  const [lojaLogoUrl, setLojaLogoUrl] = useState('');
  const [lojaLogoArquivo, setLojaLogoArquivo] = useState(null);
  const [lojaTema, setLojaTema] = useState('amber');

  const coresDisponiveis = [
    { id: 'amber', nome: 'Laranja', hex: '#f59e0b' },
    { id: 'red', nome: 'Vermelho', hex: '#dc2626' },
    { id: 'blue', nome: 'Azul', hex: '#2563eb' },
    { id: 'green', nome: 'Verde', hex: '#16a34a' },
    { id: 'black', nome: 'Preto', hex: '#111827' },
  ];

  useEffect(() => {
    async function carregarDados() {
      try {
        const { data: estData } = await supabase.from('estabelecimentos').select('*').eq('slug', slug).single();
        if (!estData) return;
        setEstabelecimento(estData);
        setLojaNome(estData.nome || '');
        setLojaLogoUrl(estData.logo_url || '');
        setLojaTema(estData.tema || 'amber'); // Carrega a cor salva
        
        const { data: catData } = await supabase.from('categorias').select('*').eq('estabelecimento_id', estData.id).order('nome');
        setCategorias(catData || []);
        
        const { data: prodData } = await supabase.from('produtos').select('*').eq('estabelecimento_id', estData.id).order('nome');
        setProdutos(prodData || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    carregarDados();
  }, [slug]);

  async function handleSalvarConfig(e) {
    e.preventDefault();
    try {
      setUploading(true);
      let finalLogoUrl = lojaLogoUrl;
      
      if (lojaLogoArquivo) {
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('imagens')
          .upload(`estabelecimentos/${estabelecimento.id}/logo_${Date.now()}`, lojaLogoArquivo);
        if (uploadErr) throw uploadErr;
        finalLogoUrl = supabase.storage.from('imagens').getPublicUrl(uploadData.path).data.publicUrl;
      }
      
      // CORREÇÃO: Usar 'tema' em vez de 'cor_tema'
      const { error } = await supabase
        .from('estabelecimentos')
        .update({ 
          nome: lojaNome, 
          logo_url: finalLogoUrl, 
          tema: lojaTema 
        })
        .eq('id', estabelecimento.id);

      if (error) throw error;
      alert('Configurações salvas com sucesso!');
      window.location.reload();
    } catch (err) { alert('Erro ao salvar: ' + err.message); } finally { setUploading(false); }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex gap-6 border-b mb-8">
        <button onClick={() => setAbaAtiva('produtos')} className={`pb-3 font-bold ${abaAtiva === 'produtos' ? 'border-b-2 border-black' : ''}`}>🍔 Cardápio</button>
        <button onClick={() => setAbaAtiva('config')} className={`pb-3 font-bold ${abaAtiva === 'config' ? 'border-b-2 border-black' : ''}`}>⚙️ Configurações</button>
      </div>

      {abaAtiva === 'config' ? (
        <form onSubmit={handleSalvarConfig} className="bg-white p-6 rounded-3xl border shadow-sm">
          <label className="block mb-2 font-bold">Nome da Loja</label>
          <input type="text" value={lojaNome} onChange={e => setLojaNome(e.target.value)} className="w-full border p-3 mb-4 rounded-xl" />
          
          <label className="block mb-2 font-bold">Tema da Loja</label>
          <div className="flex gap-3 mb-6">
            {coresDisponiveis.map(c => (
              <button key={c.id} type="button" onClick={() => setLojaTema(c.id)} className={`w-10 h-10 rounded-full transition-transform ${lojaTema === c.id ? 'ring-4 ring-offset-2 ring-black scale-110' : ''}`} style={{ backgroundColor: c.hex }} />
            ))}
          </div>

          <button type="submit" disabled={uploading} className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">
            {uploading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      ) : (
        <div className="text-gray-500 italic">...Tabela de produtos e gestão de itens...</div>
      )}
    </div>
  );
}