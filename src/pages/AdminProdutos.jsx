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
  const [editandoId, setEditandoId] = useState(null);
  const [selecionados, setSelecionados] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('produtos');

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

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
        setLojaNome(estData.nome || '');
        setLojaLogoUrl(estData.logo_url || '');
        setLojaTema(estData.tema || 'amber');

        const { data: catData } = await supabase.from('categorias').select('*').eq('estabelecimento_id', estData.id).order('nome');
        setCategorias(catData || []);
        if (catData && catData.length > 0) setCategoriaSelecionada(catData[0].nome);

        const { data: prodData } = await supabase.from('produtos').select('*').eq('estabelecimento_id', estData.id).order('nome');
        setProdutos(prodData || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    carregarDados();
  }, [slug, checkingAuth, navigate]);

  async function handleImportarCSV(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    if (!window.confirm("Importar e criar categorias?")) { e.target.value = ''; return; }

    setUploading(true);
    const processarPlanilha = async (texto) => {
      try {
        const linhas = texto.split(/\r?\n/).slice(1);
        const { data: catsAtuais } = await supabase.from('categorias').select('*').eq('estabelecimento_id', estabelecimento.id);
        const catsMap = new Map((catsAtuais || []).map(c => [c.nome.toLowerCase(), c.id]));

        const produtosParaInserir = [];
        for (let linha of linhas) {
          if (!linha.trim()) continue;
          const colunas = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
          const nomeCat = colunas[2] || 'Geral';
          let catId = catsMap.get(nomeCat.toLowerCase());
          if (!catId) {
            const { data: novaCat } = await supabase.from('categorias').insert([{ nome: nomeCat, estabelecimento_id: estabelecimento.id }]).select().single();
            catId = novaCat.id;
            catsMap.set(nomeCat.toLowerCase(), catId);
          }
          produtosParaInserir.push({ estabelecimento_id: estabelecimento.id, nome: colunas[0], preco: parseFloat(colunas[1].replace(',', '.')) || 0, categoria: nomeCat, descricao: colunas[3] || null, image_url: colunas[4] || null, ativo: true });
        }
        await supabase.from('produtos').insert(produtosParaInserir);
        alert("Sucesso!");
        window.location.reload();
      } catch (err) { alert("Erro: " + err.message); } finally { setUploading(false); }
    };
    const leitor = new FileReader();
    leitor.onload = (ev) => processarPlanilha(ev.target.result);
    leitor.readAsText(arquivo, 'UTF-8');
  }

  async function handleSalvarConfig(e) {
    e.preventDefault();
    try {
      setUploading(true);
      let finalLogoUrl = lojaLogoUrl;
      if (lojaLogoArquivo) {
        const { data } = await supabase.storage.from('imagens').upload(`estabelecimentos/${estabelecimento.id}/logo_${Date.now()}`, lojaLogoArquivo);
        finalLogoUrl = supabase.storage.from('imagens').getPublicUrl(data.path).data.publicUrl;
      }
      // CORREÇÃO: usamos 'tema' em vez de 'cor_tema'
      await supabase.from('estabelecimentos').update({ nome: lojaNome, logo_url: finalLogoUrl, tema: lojaTema }).eq('id', estabelecimento.id);
      alert('Configurações salvas!');
    } catch (err) { alert(err.message); } finally { setUploading(false); }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans text-gray-900">
      <div className="flex gap-6 border-b mb-8">
        <button onClick={() => setAbaAtiva('produtos')} className={`pb-3 font-bold ${abaAtiva === 'produtos' ? 'border-b-2 border-black' : ''}`}>🍔 Cardápio</button>
        <button onClick={() => setAbaAtiva('config')} className={`pb-3 font-bold ${abaAtiva === 'config' ? 'border-b-2 border-black' : ''}`}>⚙️ Configurações</button>
      </div>
      
      {abaAtiva === 'config' ? (
        <form onSubmit={handleSalvarConfig} className="bg-white p-6 rounded-3xl border">
          <input type="text" value={lojaNome} onChange={e => setLojaNome(e.target.value)} className="w-full border p-3 mb-4 rounded-xl" />
          <div className="flex gap-3 mb-4">
            {coresDisponiveis.map(c => <button key={c.id} type="button" onClick={() => setLojaTema(c.id)} className={`w-10 h-10 rounded-full ${lojaTema === c.id ? 'ring-4' : ''}`} style={{ backgroundColor: c.hex }} />)}
          </div>
          <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl font-bold">Salvar Configurações</button>
        </form>
      ) : (
        <div className="text-gray-500">Use a exportação/importação acima para gerir os seus produtos.</div>
      )}
    </div>
  );
}