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
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    carregarDados();
  }, [slug, checkingAuth, navigate]);

  function baixarTemplateCSV() {
    const headers = "Nome,Preco,Categoria,Descricao,Link_Imagem\n";
    const exemplo1 = "Burger Clássico,\"34,90\",Burgers,\"Blend artesanal 150g, queijo prato\",\n";
    const blob = new Blob(["\ufeff" + headers + exemplo1], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `template_produtos_${slug}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }

  async function handleImportarCSV(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    if (!window.confirm("Importar produtos e criar categorias automaticamente?")) { e.target.value = ''; return; }

    setUploading(true);
    const processarPlanilha = async (texto) => {
      try {
        const linhas = texto.split(/\r?\n/).slice(1);
        const produtosParaInserir = [];
        const catsMap = new Map(categorias.map(c => [c.nome.toLowerCase(), c.id]));

        const parseLinhaCSV = (linhaStr) => {
          let resultado = [], valorAtual = '', dentroDeAspas = false;
          for (let i = 0; i < linhaStr.length; i++) {
            let char = linhaStr[i];
            if (char === '"') dentroDeAspas = !dentroDeAspas;
            else if ((char === ',' || char === ';') && !dentroDeAspas) { resultado.push(valorAtual.trim()); valorAtual = ''; }
            else valorAtual += char;
          }
          resultado.push(valorAtual.trim());
          return resultado;
        };

        for (let linha of linhas) {
          if (!linha.trim()) continue;
          const colunas = parseLinhaCSV(linha);
          if (colunas.length < 2 || !colunas[0]) continue;

          const nomeCat = colunas[2] || 'Geral';
          let catId = catsMap.get(nomeCat.toLowerCase());
          
          if (!catId) {
            const { data: novaCat } = await supabase.from('categorias').insert([{ nome: nomeCat, estabelecimento_id: estabelecimento.id }]).select().single();
            catId = novaCat.id;
            catsMap.set(nomeCat.toLowerCase(), catId);
            setCategorias(prev => [...prev, novaCat]);
          }

          produtosParaInserir.push({
            estabelecimento_id: estabelecimento.id,
            nome: colunas[0],
            preco: parseFloat(colunas[1].replace(',', '.')) || 0,
            categoria: nomeCat,
            descricao: colunas[3] || null,
            image_url: colunas[4] || null,
            ativo: true
          });
        }
        await supabase.from('produtos').insert(produtosParaInserir);
        alert("Importação concluída!");
        const { data: prods } = await supabase.from('produtos').select('*').eq('estabelecimento_id', estabelecimento.id).order('nome');
        setProdutos(prods || []);
      } catch (err) { alert("Erro: " + err.message); } finally { setUploading(false); document.getElementById('csvInput').value = ''; }
    };

    const leitorUTF8 = new FileReader();
    leitorUTF8.onload = (ev) => {
      const texto = ev.target.result;
      if (texto.includes('\uFFFD')) {
        const leitorANSI = new FileReader();
        leitorANSI.onload = (e) => processarPlanilha(e.target.result);
        leitorANSI.readAsText(arquivo, 'windows-1252');
      } else processarPlanilha(texto);
    };
    leitorUTF8.readAsText(arquivo, 'UTF-8');
  }

  // --- Funções de Gestão ---
  async function handleSalvarProduto(e) {
    e.preventDefault();
    try {
      setUploading(true);
      let finalImageUrl = imageUrl;
      if (imagemArquivo) {
        const filePath = `produtos/${estabelecimento.id}/${Date.now()}.${imagemArquivo.name.split('.').pop()}`;
        const { error: upErr } = await supabase.storage.from('imagens').upload(filePath, imagemArquivo);
        if (upErr) throw upErr;
        finalImageUrl = supabase.storage.from('imagens').getPublicUrl(filePath).data.publicUrl;
      }
      const data = { estabelecimento_id: estabelecimento.id, nome, preco: parseFloat(preco), descricao, image_url: finalImageUrl, categoria: categoriaSelecionada, ativo: true };
      if (editandoId) await supabase.from('produtos').update(data).eq('id', editandoId);
      else await supabase.from('produtos').insert([data]);
      resetarFormulario();
      const { data: prods } = await supabase.from('produtos').select('*').eq('estabelecimento_id', estabelecimento.id).order('nome');
      setProdutos(prods || []);
    } catch (err) { alert(err.message); } finally { setUploading(false); }
  }

  function resetarFormulario() { setEditandoId(null); setNome(''); setPreco(''); setDescricao(''); setImageUrl(''); setImagemArquivo(null); }
  function handleEditarClick(p) { setEditandoId(p.id); setNome(p.nome); setPreco(p.preco); setDescricao(p.descricao); setImageUrl(p.image_url); setCategoriaSelecionada(p.categoria); }
  async function handleExcluirClick(id) { if (window.confirm('Excluir?')) { await supabase.from('produtos').delete().eq('id', id); setProdutos(produtos.filter(p => p.id !== id)); } }
  async function handleExcluirEmMassa() { if (window.confirm('Excluir selecionados?')) { await supabase.from('produtos').delete().in('id', selecionados); setProdutos(produtos.filter(p => !selecionados.includes(p.id))); setSelecionados([]); } }

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black">Gestão - {estabelecimento?.nome}</h1>
        {selecionados.length > 0 && <button onClick={handleExcluirEmMassa} className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold">🗑️ Excluir ({selecionados.length})</button>}
      </div>

      <div className="bg-amber-50 p-6 rounded-3xl mb-6 border border-amber-200">
        <button onClick={baixarTemplateCSV} className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold mb-4">📥 Baixar Modelo</button>
        <input id="csvInput" type="file" accept=".csv" onChange={handleImportarCSV} className="block text-xs" />
      </div>

      <form onSubmit={handleSalvarProduto} className="bg-white p-6 rounded-3xl border mb-8 space-y-4">
        <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border p-3 rounded-xl" />
        <input type="number" step="0.01" placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full border p-3 rounded-xl" />
        <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl font-bold">{editandoId ? 'Atualizar' : 'Salvar'}</button>
      </form>

      <div className="bg-white rounded-3xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-center"><input type="checkbox" onChange={(e) => setSelecionados(e.target.checked ? produtos.map(p=>p.id) : [])} /></th>
              <th className="p-4 text-xs uppercase">Produto</th>
              <th className="p-4 text-xs uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id}>
                <td className="p-4 text-center"><input type="checkbox" checked={selecionados.includes(p.id)} onChange={() => setSelecionados(selecionados.includes(p.id) ? selecionados.filter(id=>id!==p.id) : [...selecionados, p.id])} /></td>
                <td className="p-4 font-bold">{p.nome}</td>
                <td className="p-4 space-x-2">
                  <button onClick={() => handleEditarClick(p)} className="text-blue-600 font-bold text-xs">Editar</button>
                  <button onClick={() => handleExcluirClick(p.id)} className="text-red-600 font-bold text-xs">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}