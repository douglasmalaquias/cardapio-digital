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

  // Campos do formulário manual de Produtos
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  // Campos de Configuração da Loja
  const [lojaNome, setLojaNome] = useState('');
  const [lojaLogoUrl, setLojaLogoUrl] = useState('');
  const [lojaLogoArquivo, setLojaLogoArquivo] = useState(null);
  const [lojaCor, setLojaCor] = useState('amber');

  const coresDisponiveis = [
    { id: 'amber', nome: 'Laranja (Amber)', hex: '#f59e0b' },
    { id: 'red', nome: 'Vermelho Fast-Food', hex: '#dc2626' },
    { id: 'blue', nome: 'Azul Confiança', hex: '#2563eb' },
    { id: 'green', nome: 'Verde Natural', hex: '#16a34a' },
    { id: 'black', nome: 'Preto Premium', hex: '#111827' },
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
        setLojaCor(estData.cor_tema || 'amber');

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
    const blob = new Blob(["\ufeff" + headers + ejemplo1], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `template_produtos_${slug}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }

  function handleExportarCardapioAtual() {
    if (produtos.length === 0) return alert('Não há produtos para exportar.');
    
    const headers = "Nome,Preco,Categoria,Descricao,Link_Imagem\n";
    const linhas = produtos.map(p => {
      const pNome = `"${p.nome.replace(/"/g, '""')}"`;
      const pPreco = `"${p.preco.toFixed(2).replace('.', ',')}"`;
      const pCat = `"${p.categoria}"`;
      const pDesc = p.descricao ? `"${p.descricao.replace(/"/g, '""')}"` : "";
      const pImg = p.image_url ? `"${p.image_url}"` : "";
      return `${pNome},${pPreco},${pCat},${pDesc},${pImg}`;
    }).join('\n');
    
    const blob = new Blob(["\ufeff" + headers + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `exportacao_cardapio_${slug}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }

  async function handleImportarCSV(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    if (!window.confirm("Deseja importar os produtos e criar automaticamente as novas categorias para o cardápio?")) { e.target.value = ''; return; }

    setUploading(true);
    const processarPlanilha = async (texto) => {
      try {
        const linhas = texto.split(/\r?\n/);
        const { data: catsAtuais } = await supabase.from('categorias').select('*').eq('estabelecimento_id', estabelecimento.id);
        const catsMap = new Map((catsAtuais || []).map(c => [c.nome.toLowerCase(), c.id]));

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

        const linhasDeDados = linhas.slice(1);
        const produtosParaInserir = [];

        for (let inline da linha of linhasDeDados) {
          if (!linha.trim()) continue;
          const colunas = parseLinhaCSV(linha);
          if (colunas.length < 2 || !colunas[0]) continue;

          const nomeCat = colunas[2] ? colunas[2].trim() : 'Geral';
          let catId = catsMap.get(nomeCat.toLowerCase());
          
          // CORREÇÃO: estabelecimento_id mapeado corretamente em português
          if (!catId) {
            const { data: novaCat, error: errCat } = await supabase
              .from('categorias')
              .insert([{ nome: nomeCat, estabelecimento_id: estabelecimento.id }])
              .select()
              .single();
            
            if (errCat) throw errCat;
            catId = novaCat.id;
            catsMap.set(nomeCat.toLowerCase(), catId); 
          }

          produtosParaInserir.push({
            estabelecimento_id: estabelecimento.id,
            nome: colunas[0],
            preco: parseFloat(colunas[1].replace('R$', '').replace(/\s/g, '').replace(',', '.')) || 0,
            categoria: nomeCat, 
            descricao: colunas[3] || null,
            image_url: colunas[4] || null,
            ativo: true
          });
        }

        await supabase.from('produtos').insert(produtosParaInserir);
        alert("Cardápio e categorias importados com sucesso!");

        const { data: novasCategorias } = await supabase.from('categorias').select('*').eq('estabelecimento_id', estabelecimento.id).order('nome');
        setCategorias(novasCategorias || []);
        if (novasCategorias && novasCategorias.length > 0) setCategoriaSelecionada(novasCategorias[0].nome);

        const { data: prods } = await supabase.from('produtos').select('*').eq('estabelecimento_id', estabelecimento.id).order('nome');
        setProdutos(prods || []);
      } catch (err) { alert("Erro: " + err.message); } finally { setUploading(false); if (document.getElementById('csvInput')) document.getElementById('csvInput').value = ''; }
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

  async function handleSalvarProduto(e) {
    e.preventDefault();
    if (!nome || !preco) return alert('Nome e Preço são obrigatórios!');
    try {
      setUploading(true);
      let finalImageUrl = imageUrl;
      if (imagemArquivo) {
        const filePath = `produtos/${estabelecimento.id}/${Date.now()}.${imagemArquivo.name.split('.').pop()}`;
        const { error: upErr } = await supabase.storage.from('imagens').upload(filePath, imagemArquivo);
        if (upErr) throw upErr;
        finalImageUrl = supabase.storage.from('imagens').getPublicUrl(filePath).data.publicUrl;
      }
      
      const dadosProduto = { estabelecimento_id: estabelecimento.id, nome, preco: parseFloat(preco), descricao: descricao || null, image_url: finalImageUrl || null, categoria: categoriaSelecionada, ativo: true };
      if (editandoId) await supabase.from('produtos').update(dadosProduto).eq('id', editandoId);
      else await supabase.from('produtos').insert([dadosProduto]);
      
      resetarFormulario();
      const { data: prods } = await supabase.from('produtos').select('*').eq('estabelecimento_id', estabelecimento.id).order('nome');
      setProdutos(prods || []);
    } catch (err) { alert(err.message); } finally { setUploading(false); }
  }

  async function handleSalvarConfig(e) {
    e.preventDefault();
    if (!lojaNome) return alert('O nome da loja é obrigatório!');
    try {
      setUploading(true);
      let finalLogoUrl = lojaLogoUrl;
      
      if (lojaLogoArquivo) {
        const filePath = `estabelecimentos/${estabelecimento.id}/logo_${Date.now()}.${lojaLogoArquivo.name.split('.').pop()}`;
        const { error: upErr } = await supabase.storage.from('imagens').upload(filePath, lojaLogoArquivo);
        if (upErr) throw upErr;
        finalLogoUrl = supabase.storage.from('imagens').getPublicUrl(filePath).data.publicUrl;
      }
      
      const dadosUpdate = { nome: lojaNome, logo_url: finalLogoUrl || null, cor_tema: lojaCor };
      const { error } = await supabase.from('estabelecimentos').update(dadosUpdate).eq('id', estabelecimento.id);
      if (error) throw error;
      
      setEstabelecimento({ ...estabelecimento, ...dadosUpdate });
      alert('Configurações atualizadas com sucesso!');
    } catch (err) { alert('Erro ao salvar config: ' + err.message); } finally { setUploading(false); }
  }

  function resetarFormulario() { setEditandoId(null); setNome(''); setPreco(''); setDescricao(''); setImageUrl(''); setImagemArquivo(null); if (document.getElementById('fileInput')) document.getElementById('fileInput').value = ''; if (categorias.length > 0) setCategoriaSelecionada(categorias[0].nome); }
  function handleEditarClick(p) { setEditandoId(p.id); setNome(p.nome); setPreco(p.preco); setDescricao(p.descricao || ''); setImageUrl(p.image_url || ''); setCategoriaSelecionada(p.categoria); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  async function handleExcluirClick(id) { if (window.confirm('Deseja excluir este produto?')) { await supabase.from('produtos').delete().eq('id', id); setProdutos(produtos.filter(p => p.id !== id)); setSelecionados(selecionados.filter(item => item !== id)); } }
  async function handleExcluirEmMassa() { if (window.confirm(`Deseja realmente excluir os ${selecionados.length} produtos selecionados?`)) { await supabase.from('produtos').delete().in('id', selecionados); setProdutos(produtos.filter(p => !selecionados.includes(p.id))); setSelecionados([]); } }

  if (checkingAuth || loading) return <div className="p-6 font-medium text-gray-500">Sincronizando painel administrador...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans text-gray-900">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={() => navigate('/')} className="text-sm text-gray-500 font-bold hover:underline mb-1">← Voltar ao Hub</button>
          <h1 className="text-2xl font-black">Gestão - {estabelecimento?.nome}</h1>
        </div>
        {abaAtiva === 'produtos' && selecionados.length > 0 && (
          <button onClick={handleExcluirEmMassa} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md">
            🗑️ Excluir ({selecionados.length})
          </button>
        )}
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-8">
        <button onClick={() => setAbaAtiva('produtos')} className={`pb-3 text-sm font-bold transition-colors ${abaAtiva === 'produtos' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}>🍔 Cardápio & Produtos</button>
        <button onClick={() => setAbaAtiva('configuracoes')} className={`pb-3 text-sm font-bold transition-colors ${abaAtiva === 'configuracoes' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}>⚙️ Personalização (White-label)</button>
      </div>

      {abaAtiva === 'configuracoes' && (
        <form onSubmit={handleSalvarConfig} className="bg-white p-6 rounded-3xl shadow-sm border">
          <h2 className="text-base font-bold text-gray-900 mb-6">Identidade Visual da Loja</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome do Estabelecimento</label>
              <input type="text" value={lojaNome} onChange={e => setLojaNome(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-black bg-gray-50" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cor Principal do Cardápio</label>
              <div className="flex gap-3 mt-2">
                {coresDisponiveis.map(cor => (
                  <button 
                    key={cor.id} type="button" onClick={() => setLojaCor(cor.id)} title={cor.nome}
                    className={`w-10 h-10 rounded-full border-4 transition-transform ${lojaCor === cor.id ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: cor.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-dashed mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Upload do Logotipo</label>
              <input type="file" accept="image/*" onChange={(e) => { setLojaLogoArquivo(e.target.files[0] || null); setLojaLogoUrl(''); }} className="text-sm cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ou Link do Logotipo (URL)</label>
              <input type="text" value={lojaLogoUrl} disabled={!!lojaLogoArquivo} onChange={(e) => setLojaLogoUrl(e.target.value)} className="w-full border p-2 rounded-xl outline-none bg-white disabled:opacity-40" placeholder="https://..." />
            </div>
          </div>

          <button type="submit" disabled={uploading} className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold transition-colors">
            {uploading ? 'Salvando...' : 'Salvar Personalização'}
          </button>
        </form>
      )}

      {abaAtiva === 'produtos' && (
        <>
          <div className="bg-gray-900 text-white p-6 rounded-3xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="font-bold text-base">Automação de Cardápio via CSV</h2>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">Crie do zero baixando o modelo, ou exporte o cardápio atual para replicar em outros clientes.</p>
              <div className="flex gap-2 mt-4">
                <button onClick={baixarTemplateCSV} className="bg-white hover:bg-gray-200 text-gray-900 text-xs font-bold px-4 py-2 rounded-xl transition-colors">📥 Baixar Modelo Vazio</button>
                <button onClick={handleExportarCardapioAtual} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-md">📤 Exportar Cardápio Atual</button>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-2xl border border-dashed border-gray-600 flex flex-col items-center justify-center">
              <label className="text-xs font-black text-gray-300 uppercase mb-2">Fazer Upload de Planilha</label>
              <input id="csvInput" type="file" accept=".csv" onChange={handleImportarCSV} className="text-xs text-white file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer" />
            </div>
          </div>

          <form onSubmit={handleSalvarProduto} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border mb-8">
            <h2 className="text-sm font-bold text-gray-700 uppercase mb-2">{editandoId ? '✏️ Editar Produto' : '➕ Adicionar Produto'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Nome do Produto" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border p-3 rounded-xl outline-none" />
              <input type="number" step="0.01" placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full border p-3 rounded-xl outline-none" />
              <select value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} className="w-full border p-3 rounded-xl outline-none">
                {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
            </div>
            <input type="text" placeholder="Descrição completa" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border p-3 rounded-xl outline-none" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-dashed">
              <div><label className="block text-xs font-bold mb-1">Foto Local</label><input id="fileInput" type="file" accept="image/*" onChange={(e) => { setImagemArquivo(e.target.files[0] || null); setImageUrl(''); }} className="text-sm cursor-pointer" /></div>
              <div><label className="block text-xs font-bold mb-1">URL da Foto</label><input type="text" value={imageUrl} disabled={!!imagemArquivo} onChange={(e) => setImageUrl(e.target.value)} className="w-full border p-2 rounded-xl bg-white" /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl font-bold transition-colors">{editandoId ? 'Atualizar Dados' : 'Salvar Produto'}</button>
              {editandoId && <button type="button" onClick={resetarFormulario} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold">Cancelar</button>}
            </div>
          </form>

          <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 w-12 text-center"><input type="checkbox" checked={produtos.length > 0 && selecionados.length === produtos.length} onChange={() => setSelecionados(selecionados.length === produtos.length ? [] : produtos.map(p=>p.id))} className="w-4 h-4 cursor-pointer" /></th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Foto</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Produto</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Categoria</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Preço</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {produtos.map(prod => (
                  <tr key={prod.id} className={`hover:bg-gray-50 transition-colors ${selecionados.includes(prod.id) ? 'bg-amber-50' : ''}`}>
                    <td className="p-4 text-center"><input type="checkbox" checked={selecionados.includes(prod.id)} onChange={() => setSelecionados(selecionados.includes(prod.id) ? selecionados.filter(id=>id!==prod.id) : [...selecionados, prod.id])} className="w-4 h-4 cursor-pointer" /></td>
                    <td className="p-4"><div className="w-12 h-12 rounded-xl overflow-hidden border bg-gray-50">{prod.image_url ? <img src={prod.image_url} alt={prod.nome} className="w-full h-full object-cover" /> : <div className="text-xl flex items-center justify-center w-full h-full">🍔</div>}</div></td>
                    <td className="p-4"><div className="font-bold text-gray-900">{prod.nome}</div><div className="text-xs text-gray-400 line-clamp-1">{prod.descricao || 'Sem descrição'}</div></td>
                    <td className="p-4 text-sm text-gray-500 font-medium">{prod.categoria}</td>
                    <td className="p-4 font-black">R$ {prod.preco.toFixed(2)}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleEditarClick(prod)} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200">Editar</button>
                      <button onClick={() => handleExcluirClick(prod.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}