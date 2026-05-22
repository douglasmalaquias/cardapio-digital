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

  // Campos do formulário manual (Todos restaurados)
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
    const ejemplo1 = "Burger Clássico,\"34,90\",Burgers,\"Blend artesanal 150g, queijo prato\",\n";
    const blob = new Blob(["\ufeff" + headers + ejemplo1], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `template_produtos_${slug}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }

  // MOTOR DE IMPORTAÇÃO BLINDADO: Identifica e cria categorias no banco para aparecerem no cardápio
  async function handleImportarCSV(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    if (!window.confirm("Deseja importar os produtos e criar automaticamente as novas categorias para o cardápio?")) { e.target.value = ''; return; }

    setUploading(true);
    const processarPlanilha = async (texto) => {
      try {
        const linhas = texto.split(/\r?\n/);
        
        // Carrega o estado mais fresco de categorias do banco de dados
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

        for (let linha of linhasDeDados) {
          if (!linha.trim()) continue;
          const colunas = parseLinhaCSV(linha);
          if (colunas.length < 2 || !colunas[0]) continue;

          const nomeCat = colunas[2] ? colunas[2].trim() : 'Geral';
          let catId = catsMap.get(nomeCat.toLowerCase());
          
          // Se a categoria vinda da planilha não existir na tabela 'categorias', cria ela agora
          if (!catId) {
            const { data: novaCat, error: errCat } = await supabase
              .from('categorias')
              .insert([{ nome: nomeCat, estabelecimento_id: estabelecimento.id }])
              .select()
              .single();
            
            if (errCat) throw errCat;
            catId = novaCat.id;
            catsMap.set(nomeCat.toLowerCase(), catId); // Salva na memória do laço
          }

          produtosParaInserir.push({
            estabelecimento_id: estabelecimento.id,
            nome: colunas[0],
            preco: parseFloat(colunas[1].replace('R$', '').replace(/\s/g, '').replace(',', '.')) || 0,
            categoria: nomeCat, // Vincula o nome exato para a filtragem do cardápio
            descricao: colunas[3] || null,
            image_url: colunas[4] || null,
            ativo: true
          });
        }

        // Envia os produtos em lote
        await supabase.from('produtos').insert(produtosParaInserir);

        alert("Cardápio importado e categorias estruturadas com sucesso!");

        // Sincroniza o painel com os novos dados do banco de dados imediatamente
        const { data: novasCategorias } = await supabase.from('categorias').select('*').eq('estabelecimento_id', estabelecimento.id).order('nome');
        setCategorias(novasCategorias || []);
        if (novasCategorias && novasCategorias.length > 0) setCategoriaSelecionada(novasCategorias[0].nome);

        const { data: prods } = await supabase.from('produtos').select('*').eq('estabelecimento_id', estabelecimento.id).order('nome');
        setProdutos(prods || []);
      } catch (err) { alert("Erro ao processar lote: " + err.message); } finally { setUploading(false); document.getElementById('csvInput').value = ''; }
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

  // --- Funções de Persistência Manual ---
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
      
      const dadosProduto = { 
        estabelecimento_id: estabelecimento.id, 
        nome, 
        preco: parseFloat(preco), 
        descricao: descricao || null, 
        image_url: finalImageUrl || null, 
        categoria: categoriaSelecionada, 
        ativo: true 
      };

      if (editandoId) await supabase.from('produtos').update(dadosProduto).eq('id', editandoId);
      else await supabase.from('produtos').insert([dadosProduto]);
      
      resetarFormulario();
      const { data: prods } = await supabase.from('produtos').select('*').eq('estabelecimento_id', estabelecimento.id).order('nome');
      setProdutos(prods || []);
    } catch (err) { alert(err.message); } finally { setUploading(false); }
  }

  function resetarFormulario() { 
    setEditandoId(null); setNome(''); setPreco(''); setDescricao(''); setImageUrl(''); setImagemArquivo(null); 
    if (document.getElementById('fileInput')) document.getElementById('fileInput').value = '';
    if (categorias.length > 0) setCategoriaSelecionada(categorias[0].nome);
  }
  
  function handleEditarClick(p) { 
    setEditandoId(p.id); setNome(p.nome); setPreco(p.preco); setDescricao(p.descricao || ''); setImageUrl(p.image_url || ''); setCategoriaSelecionada(p.categoria); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  async function handleExcluirClick(id) { 
    if (window.confirm('Deseja excluir este produto?')) { 
      await supabase.from('produtos').delete().eq('id', id); 
      setProdutos(produtos.filter(p => p.id !== id)); 
      setSelecionados(selecionados.filter(item => item !== id));
    } 
  }
  
  async function handleExcluirEmMassa() { 
    if (window.confirm(`Deseja realmente excluir os ${selecionados.length} produtos selecionados?`)) { 
      await supabase.from('produtos').delete().in('id', selecionados); 
      setProdutos(produtos.filter(p => !selecionados.includes(p.id))); 
      setSelecionados([]); 
    } 
  }

  if (checkingAuth || loading) return <div className="p-6 font-medium text-gray-500">Sincronizando painel administrador...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans text-gray-900">
      
      {/* CABEÇALHO */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={() => navigate('/')} className="text-sm text-amber-600 font-bold hover:underline mb-1">← Voltar ao Hub</button>
          <h1 className="text-2xl font-black">Gestão Administrativa - {estabelecimento?.nome}</h1>
        </div>
        {selecionados.length > 0 && (
          <button onClick={handleExcluirEmMassa} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md">
            🗑️ Excluir Selecionados ({selecionados.length})
          </button>
        )}
      </div>

      {/* DASHBOARD DE IMPORTAÇÃO */}
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="font-bold text-gray-900 text-base">Onboarding: Importação Rápida via Planilha</h2>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">Baixe o modelo estruturado, preencha os produtos e faça o upload do arquivo. As novas categorias e os itens serão criados de forma totalmente automatizada para o cardápio.</p>
          <button onClick={baixarTemplateCSV} className="mt-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">📥 Baixar Modelo de Planilha (CSV)</button>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-dashed border-amber-300 flex flex-col items-center justify-center text-center">
          <label className="text-xs font-black text-gray-700 uppercase mb-2 block">Selecionar Planilha Preenchida</label>
          <input id="csvInput" type="file" accept=".csv" onChange={handleImportarCSV} className="text-xs" />
        </div>
      </div>

      {/* FORMULÁRIO MANUAL RECONSTRUÍDO COMPLETO */}
      <form onSubmit={handleSalvarProduto} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border mb-8">
        <h2 className="text-sm font-bold text-gray-700 uppercase mb-2">{editandoId ? '✏️ Ajustar / Editar Detalhes do Produto' : '➕ Cadastrar Produto Avulso'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Nome do Produto" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
          <input type="number" step="0.01" placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
          <select value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 bg-white">
            {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
          </select>
        </div>
        
        <input type="text" placeholder="Descrição completa (ingredientes, info nutricional, porção...)" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-dashed">
          <div>
            <label className="block text-xs font-bold mb-1">Vincular Foto Local</label>
            <input id="fileInput" type="file" accept="image/*" onChange={(e) => { setImagemArquivo(e.target.files[0] || null); setImageUrl(''); }} className="text-sm cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Vincular Foto por URL Externa</label>
            <input type="text" value={imageUrl} disabled={!!imagemArquivo} onChange={(e) => setImageUrl(e.target.value)} className="w-full border p-2 rounded-xl outline-none bg-white disabled:opacity-40" placeholder="https://..." />
          </div>
        </div>
        
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-colors">{editandoId ? 'Atualizar Dados' : 'Salvar Produto'}</button>
          {editandoId && <button type="button" onClick={resetarFormulario} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold">Cancelar</button>}
        </div>
      </form>

      {/* TABELA DE PRODUTOS COMPLETA COM COLUNAS RESTAURADAS */}
      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  checked={produtos.length > 0 && selecionados.length === produtos.length} 
                  onChange={() => setSelecionados(selecionados.length === produtos.length ? [] : produtos.map(p=>p.id))} 
                  className="w-4 h-4 cursor-pointer accent-amber-500 rounded" 
                />
              </th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase w-24">Foto</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Produto</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Categoria</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Preço</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {produtos.map(prod => (
              <tr key={prod.id} className={`hover:bg-gray-50 transition-colors ${selecionados.includes(prod.id) ? 'bg-amber-50/40' : ''}`}>
                <td className="p-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={selecionados.includes(prod.id)} 
                    onChange={() => setSelecionados(selecionados.includes(prod.id) ? selecionados.filter(id=>id!==prod.id) : [...selecionados, prod.id])} 
                    className="w-4 h-4 cursor-pointer accent-amber-500 rounded" 
                  />
                </td>
                <td className="p-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border bg-gray-50">
                    {prod.image_url ? <img src={prod.image_url} alt={prod.nome} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🍔</div>}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-gray-900">{prod.nome}</div>
                  <div className="text-xs text-gray-400 line-clamp-1">{prod.descricao || 'Sem descrição ou info nutricional.'}</div>
                </td>
                <td className="p-4 text-sm text-gray-500 font-medium">{prod.categoria}</td>
                <td className="p-4 font-black text-amber-600">R$ {prod.preco.toFixed(2)}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEditarClick(prod)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100">Editar / Foto</button>
                  <button onClick={() => handleExcluirClick(prod.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100">Excluir</button>
                </td>
              </tr>
            ))}
            {produtos.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400 font-medium text-sm">Nenhum produto importado até o momento.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}