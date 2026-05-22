import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminProdutos() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [lojaNome, setLojaNome] = useState('');
  const [lojaLogoUrl, setLojaLogoUrl] = useState('');
  const [lojaLogoArquivo, setLojaLogoArquivo] = useState(null);
  const [lojaTema, setLojaTema] = useState('amber');
  const [uploading, setUploading] = useState(false);

  const coresDisponiveis = [
    { id: 'amber', nome: 'Laranja', hex: '#f59e0b' },
    { id: 'red', nome: 'Vermelho', hex: '#dc2626' },
    { id: 'blue', nome: 'Azul', hex: '#2563eb' },
    { id: 'green', nome: 'Verde', hex: '#16a34a' },
    { id: 'black', nome: 'Preto', hex: '#111827' },
  ];

  useEffect(() => {
    async function carregarDados() {
      const { data } = await supabase.from('estabelecimentos').select('*').eq('slug', slug).single();
      if (data) {
        setEstabelecimento(data);
        setLojaNome(data.nome);
        setLojaTema(data.tema || 'amber');
      }
    }
    carregarDados();
  }, [slug]);

  async function handleSalvarConfig(e) {
    e.preventDefault();
    setUploading(true);
    try {
      // CORREÇÃO: O campo no banco é 'tema', não 'cor_tema'
      await supabase
        .from('estabelecimentos')
        .update({ nome: lojaNome, tema: lojaTema })
        .eq('id', estabelecimento.id);
      alert('Salvo com sucesso!');
    } catch (err) { alert(err.message); }
    finally { setUploading(false); }
  }

  return (
    <form onSubmit={handleSalvarConfig} className="p-6">
      <input value={lojaNome} onChange={e => setLojaNome(e.target.value)} className="border p-2 w-full mb-4" />
      <div className="flex gap-2 mb-4">
        {coresDisponiveis.map(c => (
          <button key={c.id} type="button" onClick={() => setLojaTema(c.id)} className={`w-10 h-10 rounded-full ${lojaTema === c.id ? 'ring-4' : ''}`} style={{ backgroundColor: c.hex }} />
        ))}
      </div>
      <button type="submit" className="bg-black text-white px-6 py-2 rounded-xl">Salvar</button>
    </form>
  );
}